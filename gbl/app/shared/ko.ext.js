//ko-extenders-custom.js
// Bundle of bindings, extenders, etc...
define(['underscore', 'jquery.all', 'knockout', 'knockout.mapping', 'message.bus'], function (_, $, ko, mapping, messageBus) {
	'use strict';

	// Shortcuts for factories

	function ko_inject(attr, value){
		if (!_.isUndefined(ko[attr])) throw "ko."+attr+" already defined in 'ko' namespace!";
		ko[attr] = value;
	};

	ko_inject('_obs_', ko.observable);
	ko_inject('_obsA_', ko.observableArray);
	ko_inject('_obsC_', ko.computed);
	ko_inject('_fromObs_', ko.utils.unwrapObservable);
	ko_inject('_fromJS_', mapping.fromJS);
	ko_inject('_toJS_', mapping.toJS);

	// proxy for message bus in a "ko" namespace:
	// ko._notify_(event).tell(data)
	ko_inject('_notify_', messageBus);

	ko_inject('_observeChanges_', function (handler, propsArray, comment) {
		_.each(propsArray, function (item) {
			if (ko.isObservable(item)) {
				item.subscribe(handler);
				return;
			}
			console.log('Observables: ', propsArray);
			throw '_observeChanges_ error: item is not observable: '
				+ typeof item + ' at point: ' + comment;
		});
	});

	ko_inject('_FieldFactory_', function (namespace, obsConstructor) {
		return function (
				name, // field name 
				defValue, // default value, if not found in "args"
				args, // object which holds current values {name: value}
				itemFactory // constructor if item is instance of a custom class
				) {
			// arguments: namespace, name, defValue, args
			function unwrap(v) { return _.isFunction(v) ? v() : v; };
			var 	
				undefined,
				isComputed = (obsConstructor == ko.computed || obsConstructor == ko.pureComputed),
				argValue = (args) ? unwrap(args[name]) : undefined,
				value = isComputed ? defValue : (_.isUndefined(argValue) ? defValue : argValue);

			value = unwrap(value); // in case if value is "observable"
			
			if (_.isUndefined(value)) 
				throw '_FieldFactory_ error: required value is missed for ' + name;

			// instantiate items if value is array and if factory specified:
			if (typeof itemFactory == 'function') {
				if (_.isArray(value)) {
					var buffer = [];
					_.each(value, function (data) {
						buffer.push(itemFactory(data))
					});
					value = buffer;
				} else {
					// scalar value
					value = itemFactory (value);
				}
			}

			// create or update observable field:
			if (ko.isObservable(namespace[name])) {
				// field exists and is observable:
				namespace[name] (value);
			} else {
				// create new field
				namespace[name] = obsConstructor(value);
			}

			// return new observable field for chaining:
			return namespace[name]; // <- for chaining
		}
	});

	// creats read-only property, emulates observable behaviour on read operations
	ko_inject('_lookup_', // for read-only props, closure factory
		function (data){
			return function(){
				return data;
			}
		});

	ko_inject('_traverseTree_', function(root, tagarray, silent) {
			/*
					root, // object
					tagarray, // "path", ['prop1 = 'prop2'] means root['prop1']['prop2']
					silent // if true - do not raise error on intermediate "nulls"
			*/
			var 
				current = root,
				handleErr = silent ? _TRACE_ : _ERR_, 
				tag;

			for (var i=0, len = tagarray.length, len_1=len-1; i<len; i++) {

				tag = tagarray[i];

				if (_.isNull(current)) {
					handleErr('Warning: getNested: intermediate member is NULL: ', tag);
					return null;
				}
				if (_.isUndefined(current)) {
					handleErr('Warning: getNested: intermediate member is UNDEFINED: ', tag);
					return undefined;
				}
				// do not unwrap last object from observable (if i == len-2)
				current = (len_1 == i) ? current[tag] : ko._fromObs_(current[tag]);
			}
			return current;
		});

	ko_inject('_bindCollectionPropsTo_', function (Obj, childrenPropName) {
			var children = _.assertDefined(childrenPropName, 'bindCollectionPropsTo() error: childrenPropName is required!');
			// Ensure that children is observable array:
			if (!Obj[children] || !ko.isObservable(Obj[children]) || !Obj[children].splice ){
				console.log('parent dump ', Obj);
				throw new Error('bindCollectionPropsTo() error in parent object: "'+Obj._rtti+'": specified  "' 	
					+children+ '" property is not observable array: ' + typeof Obj[children]+ ' '+ko.isObservable(Obj[children]));
			}
			// add basic properties and methods for object (suppose it has .Items() observable array)

			Obj.selectedItem = ko._obs_(null);

			Obj.length = function () 			{ return Obj[children]().length;	} // Frames
			Obj.select = function (item) 		{ Obj.selectedItem(item);	}
			Obj.IsSelected = function (item) 	{ return ( Obj.selectedItem() === item )	}
			Obj.each = function (iterator)	{ _.each(Obj[children](), iterator);	}

			Obj.findFirst = function (rule) {
				// search frist item which satisfy for condition / rule:
				// {prop1:val1, prop2:val2, ...}
				// rule can contain any attr of Item (like Label, DomID, ...)
				var found = null, match;
				_.assertTrue(typeof rule == 'object', 
					'Invalid argument type for .findFirst(): '+typeof(rule)+
					'. Allowed type: object.');

				_.find(Obj[children](), function (item) {
					// return false if found to stop iterations
					match = true;
					for (var name in rule) {
						if (_.isUndefined(item[name])) 
							throw new Error('Error in .findFirst() - invalid rule name: '+name);
						match = match && (ko._fromObs_(item[name]) == rule[name]);
					}
					if (match) {
						found = item;
						return found; // do not continue iterations, item found
					}
				});
				return found; // return undefined to continue iterations...
			}
		});

	// EXTENDERS


	// Numeric-type extender for observables
	/*
	Sample usage:  
	function AppViewModel(one, two) {
		this.myNumberOne = ko.observable(one).extend({ numeric: 0 });
		this.myNumberTwo = ko.observable(two).extend({ numeric: 2 });
	}
	 
	ko.applyBindings(new AppViewModel(221.2234, 123.4525));	
	*/ 

	ko.extenders.numeric = function(target, precision) {
		//create a writable computed observable to intercept writes to our observable
		var result = ko.pureComputed({
			read: target,  //always return the original observables value
			write: function(newValue) {
				var current = target(),
					roundingMultiplier = Math.pow(10, precision),
					newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
					valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
	 
				//only write if it changed
				if (valueToWrite !== current) {
					target(valueToWrite);
				} else {
					//if the rounded value is the same, but a different value was written, force a notification for the current field
					if (newValue !== current) {
						target.notifySubscribers(valueToWrite);
					}
				}
			}
		}).extend({ notify: 'always' });
	 
		//initialize with current value to make sure it is rounded appropriately
		result(target());
	 
		//return the new computed observable
		return result;
	};	

	ko.extenders.ntfChange = function (target, eventName) {
		target.isDirty = ko.observable(false);
		target.originalValue = target();
		target.subscribe(function (newValue) {
			// use != not !== so numbers will equate naturally
			var changed = newValue != target.originalValue;
			target.isDirty(changed);
			messageBus(eventName).tell({sender: target, value: newValue});
		});
		return target;
	};

	ko.extenders.ntfListen = function (target, options) {
		var eventName = _.assertDefined( options.eventName ), 
			newValueOrHandler = _.assertDefined( options.newValueOrHandler );
		if (typeof newValueOrHandler == 'function') {
			messageBus( eventName ).listen(newValueOrHandler);
		} else {
			_.assertTrue(_.isBoolean(target.peek()), 
				'ko.ntfListen extender with constant instead of handler can be applied only to observable with boolean type!');
			messageBus(eventName).listen(function () {
				// assign value on event
				target(newValueOrHandler);
			});
		}
		return target;
	};

	// Receipt from: http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html
    (function() {
      var existing = ko.bindingProvider.instance;

        ko.bindingProvider.instance = {
            nodeHasBindings: existing.nodeHasBindings,
            getBindings: function(node, bindingContext) {
                var bindings;
                try {
                   bindings = existing.getBindings(node, bindingContext);
                }
                catch (ex) {
                   if (window.console && console.log) {
                       console.log("binding error", ex.message, node, bindingContext);
                   }
                }

                return bindings;
            }
        };

    })();

	

});