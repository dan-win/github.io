//underscore.ext.js
// custom extensions for underscore

// UMD wrapping for module used (for plain JS, AMD or CommonJS modes)
(function (root, factory) {
    if (typeof define === "function" && define.amd) { // AMD mode
        define(["underscore"], factory);
    } else if (typeof exports === "object") { // CommonJS mode
    	var _ = (typeof window._ === 'undefined') ? require("underscore") : window._;
        module.exports = factory(_);
    } else {
    	// Module does not define some globals, 
    	// so ignore returned value:
        factory(root._); // Plain JS, "rtl" is in window scope
    }
}(this, function (_) {

//======================
	'use strict';

	// Set delimiters for templates:
	_.templateSettings = {
		interpolate: /\{(.+?)\}/g
	};

	_.mixin({
		/**
		 * Create a new class of Error. Receipt from: http://stackoverflow.com/a/27925672.
		 * @method createErrorType
		 * @param  {string}        name Name of Error type (class name)
		 * @param  {function}        init Optional function which receives (this, arguments) upon instantiation of custom error (passed from constructor)
		 * @return {function, constructor}             Consructor fucntion for a custom error
		 */
		createErrorType: function (typeName, init, parentClass) {
			function E(message) {
				if (this === window) throw new Error('Call \"'+typeName+'\" constructor with a \"new\" keyword!');
				if (!Error.captureStackTrace)
					this.stack = (new Error()).stack;
				else
					Error.captureStackTrace(this, this.constructor);
				this.message = message;
				init && init.apply(this, arguments);
			}
			parentClass = parentClass || Error;
			E.prototype = new parentClass();
			E.prototype.name = typeName;
			E.prototype.constructor = E;
			return E;
		},

		createExceptionClass: function (typeName, parentClass) {
			return _.createErrorType(typeName, function (message, attributes) {
				this.message = message || '';
				this.code = attributes && _.popAttr(attributes, 'code') || -1;
				_.extend(this, attributes || {});
				this.toString = function () {
					return [typeName,' {message:\"', this.message, '\", code:', this.code, '}']. join('');
				}
			}, parentClass);
		},

		Exception: function (errMessage, attributes) {
			var 
				errName = attributes && _.popAttr(attributes, 'name') || 'CustomError';
			return new (_.createExceptionClass(errName))(errMessage, attributes);
		},

		raise: function (message, attributes) {
			throw _.Exception(message, attributes);
		},
		
		assertTrue: function (value, errmessage) {
			if (!value) _.raise(errmessage || 'Assertion failure: false value: ' + value );
			return value;
		},
		
		assertDefined: function (value, errmessage) {
			if (_.isUndefined(value)) _.raise(errmessage || 'Assertion failure: value is undefined' );
			return value;
		},

		assertType: function (value, arg, errMessage) {
			function testType(value, arg) {
				if (_.isArray(arg))
					return _.some(arg, function(aType) {
						return testType(value, aType) });
				if (_.isString(arg))
					return (typeof value === arg);
				if (_.isFunction(arg))
					return arg(value);
				throw new Error('assertType rule must be a typename or function')
			}
			if (testType(value, arg)) return value;
			throw new Error((errMessage || 'Property error:') + ('\ntype mismatch: \"'
				+ typeof value + '\" instead of: \"' + arg.toString() + '\"'));
		},

		renderStr: function (template, data) {
			var 
				compiled = _.template(template),
				plain = {}, 
				value;

			for (var name in data) {
				value = data[name];
				plain[name] = (typeof value === 'function') ? value() : value;
			}
				
			console.log('rendering: ',plain,', template: ',template);
			return compiled(data);
			// var buff = template, 
			// 	value;
			// for (var name in data) {
			// 	console.log('Template parsing name: ', name);
			// 	value = _.assertDefined(data[name], 
			// 		'Template error: undefined data for name \"'
			// 		+name+'\" in template: '+ template);
			// 	value = _.isFunction(value) ? value() : value;
			// 	buff = buff.replace('{'+name+'}', value );
			// }
			// return buff;
		},

		// renderTimestamp: function () {
		// 	function align2Digits (value) {
		// 		var s = value.toString();
		// 		return (s.length > 1) ? s : '0'+s;
		// 	}
		// 	var d = new Date();
		// 	return d.getFullYear() + 
		// 			'-' + align2Digits( d.getMonth() + 1 ) + 
		// 			'-' + d.getDate() + 
		// 			' ' + align2Digits(d.getHours()) + 
		// 			':' + align2Digits(d.getMinutes()) + 
		// 			':' + align2Digits(d.getSeconds()); 
		// },

		applyReferenceID: function (obj, prefix) {
			obj._rid = _.uniqueId(prefix);
			obj.ReferenceID = function () { return obj._rid; }
		},

		// Unique indentifier, see receipt: http://stackoverflow.com/a/13403498
		qGUID: function (prefix) {
			prefix = prefix || '';
			return prefix+Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);
		},

		// ,checkRTTI: function (obj, classConstructor) {
		// 	return (_.isObject(obj) && obj._rtti && obj._rtti == classConstructor._rtti);
		// }
		
		//----------------------------
		
		/**
		 * Perform deep clone of object (all nested objects becomes a new, unique instance)
		 * @method deepClone
		 * @param  {object}  obj Source object
		 * @return {object}      Cloned object
		 */
		deepClone: function (obj) {
			// to-do: how it works with observables like Knockout functions()?
			return JSON.parse(JSON.stringify(obj))
		},

		/**
		 * Add or override attributes of object, including the nested objects
		 * @method deepExtend
		 * @param  {object}   tObj   Destination object (will be modified)
		 * @param  {object}   srcObj, ... Source object(s)
		 * @return {object}          Extended object (same instance of tObj)
		 */
		deepExtend: function (tObj, ___) {
			var length = arguments.length;
			if (length < 2 || tObj === null) return tObj;
			for (var index = 1; index < length; index++) {
				var source = arguments[index];
				for (var key in source) {
					if (!source.hasOwnProperty(key)) continue;
					var member = source[key];
					if (typeof member === 'function') {
						tObj[key] = source[key];	
					} else if (typeof member === 'object') {
						tObj[key] = _.deepExtend(tObj[key] || {}, member);
					} else {
						tObj[key] = source[key];	
					}
				}
			}
			return tObj;
		},

		/**
		 * Add or override attributes of object, including the nested objects
		 * Only attributes defined in tObj will be overriden (extra attributes from srcObj will be ignored)
		 * @method deepExtend
		 * @param  {object}   tObj   Destination object (will be modified)
		 * @param  {object}   srcObj, ... Source object(s)
		 * @return {object}          Extended object (same instance of tObj)
		 */
		replaceDefinedProps: function (tObj, srcObj) {
			var length = arguments.length;
			if (length < 2 || tObj == null) return tObj;
			for (var index = 1; index < length; index++) {
				var source = arguments[index];

				for (var key in source) {
					if (!source.hasOwnProperty(key)) continue;
					// bypass undefined props:
					if (tObj[key] === void 0) continue;
					var member = source[key];
					if (typeof member === 'function') {
						tObj[key] = source[key];	
					} else if (typeof member === 'object') {
						tObj[key] = _.replaceDefinedProps(tObj[key], member)	
					} else {
						tObj[key] = source[key];	
					}
				}

			}
			return tObj;
		},

		removeUndefinedProps: function (obj) {
			var buffer = {};
			_.each(obj, function (value, key) {
				if (value === void 0) return;
				if (typeof value === 'object') 
					buffer[key] = _.removeUndefinedProps(value);
				else 
					buffer[key] = value;
			})
			return buffer;
		},

		/**
		 * Delete "key" in "obj" and return "obj.key" if defined. 
		 * @function popProperty
		 * @param  {object}    obj [description]
		 * @param  {string}    key [description]
		 * @return {any}        [description]
		 */
		popAttr: function (obj, key) {
			var value = obj[key];
			if (value === void 0) return;
			delete obj[key];
			return value;

		},

		getQueryVariable: function(variable, source) {
			var query = (source || window.location.search).substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return decodeURIComponent((pair[1] + '').replace(/\+/g, '%20'));
				}
			}
			return null;
		},

		serializeUriVariables: function(hash) {
			var buffer = [];
			_.each(hash, function(value, key) {
				buffer.push(
					[
						key,
						encodeURIComponent((value.toString()).replace(/\%20/g, '+'))
					].join('=')
				);
			});
			return buffer.join('&');
		},

		deserializeUriVariables: function(str) {
			var
				vars = str.split("&"),
				buffer = {},
				keyval;
			_.each(vars, function(pair) {
				keyval = pair.split('=');
				buffer[keyval[0]] = decodeURIComponent((keyval[1].toString()).replace(/\+/g, '%20'));
			});
			return buffer;
		}


	});

	return _;

}));
