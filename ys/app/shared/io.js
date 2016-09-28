/*
//
// Framework for integration with server API
// Copyright D.Zimoglyadov.
// License: MIT (free for all kind of projects)
//
*/


/*
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

About promises (from https://github.com/kriskowal/q):

behaviour of handler passed to ".then":
"
	[RESOLVE]: If you return a value in a handler, outputPromise will get fulfilled.

	[REJECT]:If you throw an exception in a handler, outputPromise will get rejected.

	[GO to new promise / TRANSFORM]: If you return a promise in a handler, outputPromise will “become” that promise. Being able to become a new promise is useful for managing delays, combining results, or recovering from errors.
"

*/

/*
To-do: split module to IO and IO.Http
add _decodeError method (similar o _decodeData)
Refresh JSDoc
Implement "filterCollection" method
 */
// IO base classes and Ajax tools
(function(root, factory) {
		var _modname = 'IO';
		if (typeof define === "function" && define.amd) { // AMD mode
			define(["underscore", "json2"], factory);
		} else if (typeof exports === "object") { // CommonJS mode
			var _ = (typeof window._ === 'undefined') ? require("underscore") : window._;
			var JSON = (typeof window.JSON === 'undefined') ? require("json2") : window.JSON;
			module.exports = factory(_, JSON);
		} else {
			root[_modname] = factory(root._, root.JSON); // Plain JS, "rtl" is in window scope
		}
	}(this, function(_, JSON) {
		// body...

		var 
			mandatory = _.assertDefined,
			isFunction = _.isFunction,
			isNull = _.isNull,
			isUndefined = _.isUndefined,
			assertType = _.assertType,
			assertDefined = _.assertDefined,
			assertTrue = _.assertTrue,
			ownKeys = _.keys,
			Exception = _.Exception,
			createExceptionClass = _.createExceptionClass,
			raise = _.raise,
			
			deepClone = _.deepClone,
			deepExtend = _.deepExtend,
			extend = _.extend,
			replaceDefinedProps = _.replaceDefinedProps,
			popAttr = _.popAttr,
			getQueryVariable = _.getQueryVariable,
			serializeUriVariables = _.serializeUriVariables,
			deserializeUriVariables = deserializeUriVariables;


		var 
			BaseError = createExceptionClass('IO.Error', Error),
			ArgumentError = createExceptionClass('IO.ArgumentError', BaseError),
			RequestError = createExceptionClass('IO.RequestError', BaseError),
			AuthError = createExceptionClass('IO.AuthError', BaseError),
			EncodeErrorClass = createExceptionClass('IO.EncodeError', BaseError),
			DecodeErrorClass = createExceptionClass('IO.DecodeError', BaseError);

		// ***********************************************************

		/**
		 * Same as _.deepExtend but the "data" attribute passed by reference (as a whole) without member-by-member replication
		 * (this is important if data contains native obejcts like File, Blob, etc.)
		 * @method extendOptions
		 * @param  {object}      tObj   Destintion object (will be changed)
		 * @param  {object}      srcObj Multiple "source" arguments allowed
		 * @return {object}             Updated tObj
		 */
		var extendOptions = function (tObj, srcObj) {
			var 
				length = arguments.length, 
				data;
			if (length < 2 || tObj === null) return tObj;

			for (var index = 1; index < length; index++) {
				var source = arguments[index];
				if (!source) continue;
				// Prevent data corruption (in case if "data" contains native or custom objects):
				data = popAttr(source, 'data');
				tObj = deepExtend(tObj, source);
				if (!!data) tObj['data'] = data;
			}
			return tObj;
		};

		////  options = {verb, "headers, ...., body===data"}
		///// VECTOR: args: pathArgs, qryArgs
		/// args type: rqOptions = {pathArgs, qryArgs, data}, tpArgs

		function endpoint(urn, opts) {
			var
				self = {
					_urn: urn,
					_pathNodes: urn.split('/'),
					_argsMap: [],

					_options: opts || {}
				};

			// Parse argument placeholders in URN:
			_.each(self._pathNodes, function(name, indexInPath) {
				if (':' == name.charAt(0)) { // argument found
					name = name.substring(1); // remove leading ":" :
					self._argsMap.push([indexInPath, name]); // add to map "name -> index in tags"
				}
			});
			
			_.extend(self, {
				
				/**
				 * Renders the actual path: replaces optional placeholders like ':arg1' (if any) with actual values.
				 * @method
				 * @param  {object} pathArgs Map of "path" arguments in form "argName":"value", used for path templates like "/path/to/:argName/service"
				 * @return {string}          The actual path
				 */
				'_resolveUrn': function (pathArgs) {
					var
						unknownArgs,
						pathBuffer = self._pathNodes.slice(0), // <-- local copy of entire array
						argsToProcess = deepClone(pathArgs);

					assertType(pathArgs, 'object', ' "pathArgs" must be an object !');
					_.each(self._argsMap, function(pair) {
						var indexInPath = pair[0], name = pair[1], value = popAttr(argsToProcess, name);
						if (typeof value === 'undefined')
							throw new ArgumentError('Required argument \"' + name + '\" missed!');
						// replace placeholder by actual value:
						pathBuffer[indexInPath] = value;
					});

					if (_.size(argsToProcess) > 0)
						throw new ArgumentError('Arguments \"' + unknownArgs.join(',') + '\" now allowed for: ' + self._urn);

					return pathBuffer.join('/');
				},

				'_rqPromise': function (transport, verb, rqOptions) {
					var
						tpHandler = mandatory(
							transport[verb], 'Transport does not support verb: ' + verb),
						_a = rqOptions || {},
						pathArgs	= _a.pathArgs || {},
						_urn 		= (pathArgs) ? self._resolveUrn(pathArgs) : self._urn,

						o = extendOptions({}, opts, _a);

					if ( ['create', 'update'].indexOf(verb) >=0 && typeof data === 'undefined')
						throw new RequestError('Request error: "create" and "update" verbs require assigned "requestData" function!');
					console.log('Calling transport: ', transport._tname, verb, _urn, o);
					return tpHandler(_urn, o)
				},

				'urn': function () {return self._urn},

				'pathNodes': function () {return _.clone(self._pathNodes)},

				'options': function (obj) {
					if (typeof obj === 'undefined') return self._options; 
					extendOptions(self._options, obj);
					return this;
				},

				'child': function (u, o) {
					o = deepExtend({}, self._options, o || {});
					return endpoint(self._urn + '/' + mandatory(u, 'child "urn" missed!'), o)
				},

				'clone': function () {return endpoint(self._urn, deepClone(self._options))},

				/**
				 * [description]
				 * @method
				 * @param  {[type]} transport [description]
				 * @param  {object} rqOptions    {<object>pathArgs, <object>qryArgs, <optional object>data}
				 * @return {[type]}           [description]
				 */
				'fetch': function (transport, rqOptions) {
					return self._rqPromise(transport, 'fetch', rqOptions)},

				'create': function(transport, rqOptions) {
					console.log('Calling "create": ', rqOptions);
					return self._rqPromise(transport, 'create', rqOptions)},

				'update': function(transport, rqOptions) {
					return self._rqPromise(transport, 'update', rqOptions)},

				'read': function(transport, rqOptions) {
					return self._rqPromise(transport, 'read', rqOptions)},

				'delete': function(transport, rqOptions) {
					return self._rqPromise(transport, 'delete', rqOptions)},

				'query': function(transport, rqOptions) {
					return self._rqPromise(transport, 'query', rqOptions)},

				/**
				 * [description]
				 * @method
				 * @param  {[type]} transport   [description]
				 * @param  {function} setter      Function or ko.observableArray. If function - it must support protocol: f(value) sets value, f() - returns the current value
				 * @param  {function} itemFactory Optional factory if the collection item is a custom object
				 * @param  {[type]} rqOptions   Request options (optional)
				 * @return {Promise}             [description]
				 */
				'loadCollection': function (transport, setter, itemFactory, rqOptions) {
					var 
						o = rqOptions || {};
					mandatory(setter, '"setter" argument is required');
					itemFactory = itemFactory || function (d) {return d};

					return self.read(transport, o).then(function (response) {
						var buffer = [];
						console.log('loadCollection -> response data: ', response);
						_.each(response, function (itemData, key) {
							console.log('Loading item: ', itemData);
							buffer[parseInt(key)] = itemFactory(itemData);
						});
						setter(buffer);
						// in case with knockoutjs observableArray - it returns object which contains result
						return (typeof setter.peek === 'function') ? setter.peek() : setter(); 
					})
				},

				/**
				 * Stores array in JSON storage (internally it stores object where keys are indices converted to strings)
				 * About considerations why to use such approach - see https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
				 * @method
				 * @param  {[type]} transport [description]
				 * @param  {array/function} jsArray   array or function which returns array (or ko.observableArray)
				 * @param  {[type]} rqOptions [description]
				 * @return {[type]}           [description]
				 */
				'saveCollection': function (transport, jsArray, rqOptions) {
					var 
						a = mandatory(jsArray, 'IO.saveCollection error: jsArray is mandatory'),
						source = (typeof a.peek == 'function') ? a.peek() : a,
						data = {},
						o;
					// Convert array to object in form: {<string>index: value}:
					_.each(source, function (item, index) {
						if (!item.toJS) console.log('!!! item has no toJS method:', item);
						data[index.toString()] = (item.toJS) ? item.toJS() : item;
					}),
					o = _.extend({}, rqOptions || {}, {
						'data': data
					}); 

					console.log('saveCollection: ', data);
					
					return self.create(transport, o)
				},

				/**
				 * Loads array from JSON storage (where array stored as object where keys are indices converted to strings)
				 * @method
				 * @param  {[type]} transport [description]
				 * @param  {[type]} key       [description]
				 * @param  {[type]} model     [description]
				 * @param  {[type]} rqOptions [description]
				 * @return {[type]}           [description]
				 */
				'loadModel': function (transport, key, model, rqOptions) {
					var 
						o = _.extend({}, rqOptions || {}, {
							'pathArgs': {'key': key}
						}); 

					mandatory(model, 'IO.load error: target model must be instantiated before load!');

					return self.read(transport, o).then(function (response) {
						if (typeof model.updateValues === 'function') {
							model.updateValues(response);
							console.log('Your model does not provide "updateValues" method')
						} else { 
							deepExtend(model, response)
						}
						return model;
					})
				},

				'saveModel': function (transport, key, model, rqOptions) {
					var 
						m = mandatory(model, 'IO.load error: target model must be instantiated before load!'),
						o = _.extend({}, rqOptions || {}, {
							'data': (typeof m.toJS === 'function') ? m.toJS() : m,
							'pathArgs': {'key': key}
						}); 
					console.log('saveModel-->', o);
					return self.create(transport, o)
				},

				'updateModel': function (transport, key, model, rqOptions) {
					var 
						m = mandatory(model, 'IO.load error: target model must be instantiated before load!'),
						o = _.extend({}, rqOptions || {}, {
							'data': (typeof m.toJS === 'function') ? m.toJS() : m,
							'pathArgs': {'key': key}
						}); 
					return self.update(transport, o)
				},

				'remove': function (transport, key, rqOptions) {
					var 
						o = _.extend({}, rqOptions || {}, {
							'pathArgs': {'key': key}
						}); 
					return self.delete(transport, o);
				}
			});

			// Initialization (optional)
			if (endpoint.initInstance) {
				// _epNode becomes "this" inside function:
				endpoint.initInstance.call(self);
			}

			return self;
		}

		/**
		 * Bundle of transport and endpoint
		 * @method service
		 * @param  {[type]} urn       [description]
		 * @param  {[type]} transport [description]
		 * @param  {[type]} opts      [description]
		 * @return {[type]}           [description]
		 */
		function service (urn, opts) {
			var 
				self = endpoint(urn, opts);
				// save "inherited" methods:
				// _loadCollection = self.loadCollection,
				// _saveCollection = self.saveCollection,
				// _loadModel = self.loadModel,
				// _saveModel = self.saveModel,
				// _updateModel = self.updateModel,
				// _remove = self.remove;
				// _transport;

			self.transport = function (value) {
				if (typeof value === 'undefined') return self._transport;
				self._transport = value;
				return self;
			};

			/**
			 * [init description]
			 * @method init
			 * @param  {[type]} config  [description]
			 * @param  {[type]} appName Optional name (see usage sample in io.firebase)
			 * @return {[type]}         [description]
			 */
			self.init = function (config, appName) {
				return self._transport.init(config, appName)
			}

			self.signIn = function (args) {
				return self._transport.signIn(args)
			}

			self.signOut = function () {
				return self._transport.signOut()
			}

			// self.fetch = function (rqOptions) {
			// 	return self._rqPromise(_transport, 'fetch', rqOptions)}

			// self.create = function(rqOptions) {
			// 	return self._rqPromise(_transport, 'create', rqOptions)}

			// self.update = function(rqOptions) {
			// 	return self._rqPromise(_transport, 'update', rqOptions)}

			// self.read = function(rqOptions) {
			// 	return self._rqPromise(_transport, 'read', rqOptions)}

			// self.delete = function(rqOptions) {
			// 	return self._rqPromise(_transport, 'delete', rqOptions)}

			// self.query = function(rqOptions) {
			// 	return self._rqPromise(_transport, 'query', rqOptions)}

			// self.loadCollection = function (setter, itemFactory, rqOptions) {
			// 	return _loadCollection(self._transport, setter, itemFactory, rqOptions)}

			// self.saveCollection = function (jsArray, rqOptions) {
			// 	return _saveCollection(self._transport, jsArray, rqOptions)}

			// self.loadModel = function (key, model, rqOptions) {
			// 	return _loadModel(self._transport, key, model, rqOptions)}

			// self.saveModel = function (key, model, rqOptions) {
			// 	return _saveModel(self._transport, key, model, rqOptions)}

			// self.updateModel = function (key, model, rqOptions) {
			// 	return _updateModel(self._transport, key, model, rqOptions)}

			// self.remove = function (key, rqOptions) {
			// 	return _remove(self._transport, key, rqOptions)
			// }

			return _.extend(self, {
				/**
				 * [description]
				 * @method
				 * @param  {[type]} transport   [description]
				 * @param  {function} setter      Function or ko.observableArray. If function - it must support protocol: f(value) sets value, f() - returns the current value
				 * @param  {function} itemFactory Optional factory if the collection item is a custom object
				 * @param  {[type]} rqOptions   Request options (optional)
				 * @return {Promise}             [description]
				 */
				'loadCollection': function (setter, itemFactory, rqOptions) {
					var 
						o = rqOptions || {};
					mandatory(setter, '"setter" argument is required');
					itemFactory = itemFactory || function (d) {return d};

					return self.read(self._transport, o).then(function (response) {
						var buffer = [];
						console.log('loadCollection -> response data: ', response);
						_.each(response, function (itemData, key) {
							console.log('Loading item: ', itemData);
							buffer[parseInt(key)] = itemFactory(itemData);
						});
						setter(buffer);
						// in case with knockoutjs observableArray - it returns object which contains result
						return (typeof setter.peek === 'function') ? setter.peek() : setter(); 
					})
				},

				/**
				 * Stores array in JSON storage (internally it stores object where keys are indices converted to strings)
				 * About considerations why to use such approach - see https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
				 * @method
				 * @param  {array/function} jsArray   array or function which returns array (or ko.observableArray)
				 * @param  {[type]} rqOptions [description]
				 * @return {[type]}           [description]
				 */
				'saveCollection': function (jsArray, rqOptions) {
					var 
						a = mandatory(jsArray, 'IO.saveCollection error: jsArray is mandatory'),
						source = (typeof a.peek == 'function') ? a.peek() : a,
						data = {},
						o;
					// Convert array to object in form: {<string>index: value}:
					_.each(source, function (item, index) {
						if (!item.toJS) console.log('!!! item has no toJS method:', item);
						data[index.toString()] = (item.toJS) ? item.toJS() : item;
					}),
					o = _.extend({}, rqOptions || {}, {
						'data': data
					}); 

					console.log('saveCollection: ', data);
					
					return self.create(self._transport, o)
				},

				/**
				 * Loads array from JSON storage (where array stored as object where keys are indices converted to strings)
				 * @method
				 * @param  {[type]} key       [description]
				 * @param  {[type]} model     [description]
				 * @param  {[type]} rqOptions [description]
				 * @return {[type]}           [description]
				 */
				'loadModel': function (key, model, rqOptions) {
					var 
						o = _.extend({}, rqOptions || {}, {
							'pathArgs': {'key': key}
						}); 

					mandatory(model, 'IO.load error: target model must be instantiated before load!');

					return self.read(self._transport, o).then(function (response) {
						if (typeof model.updateValues === 'function') {
							model.updateValues(response);
							console.log('Your model does not provide "updateValues" method')
						} else { 
							deepExtend(model, response)
						}
						return model;
					})
				},

				'saveModel': function (key, model, rqOptions) {
					var 
						m = mandatory(model, 'IO.load error: target model must be instantiated before load!'),
						o = _.extend({}, rqOptions || {}, {
							'data': (typeof m.toJS === 'function') ? m.toJS() : m,
							'pathArgs': {'key': key}
						}); 
					console.log('saveModel-->', o, o.data);
					return self.create(self._transport, o)
				},

				'updateModel': function (key, model, rqOptions) {
					var 
						m = mandatory(model, 'IO.load error: target model must be instantiated before load!'),
						o = _.extend({}, rqOptions || {}, {
							'data': (typeof m.toJS === 'function') ? m.toJS() : m,
							'pathArgs': {'key': key}
						}); 
					return self.update(self._transport, o)
				},

				'remove': function (key, rqOptions) {
					var 
						o = _.extend({}, rqOptions || {}, {
							'pathArgs': {'key': key}
						}); 
					return self.delete(self._transport, o);
				}

			});

		}

		Transport.registry = {uriScheme:{}};

		Transport.factory = function(url, options) {
			var
				scheme = url.split(':')[0],
				factory = Transport.registry.uriScheme[scheme];

			if (typeof factory === 'undefined')
				throw new BaseError('Unknown transport scheme: ' + scheme);
			console.log('Transport.factory: ',factory.name,' found for ', scheme);
			return factory(url, options);
		}

		var transport = Transport.factory;

		function Transport(url, options) {
			var
				self = {
					_tname: 'Transport',
					_url: url || '',
					_options: options || {},
					_accepts: ['object', 'string', 'undefined'],

					_encodeTo: 'js-object', // <- means "no conversion"
					// Convert data from <format> to ''
					_decodeFrom: 'js-object',
					_methodsMap: {
						'create': 'create',
						'update': 'update',
						'read': 'read',
						'delete': 'delete',
						'query': 'query'
					}
				};
				// type of input data - always only "object" or "string"

			return _.extend(self, {
				'_escapePath': function (value) {
					return value;
				},

				'init': function (config, appName) {
					return self; // chaining
				},

				'signIn': function (args) {
					return Promise.resolve({});
				},

				'signOut': function () {
					return Promise.resolve({});
				},

				'user': function () {
					return {
						uid: 'guest',
						displayName: 'Guest',
						isAnonymous: true
					}
				},

				'_dispatchRequest': function(verb, urn, rqOptions) {
					try {
						var 
							_d = rqOptions.data,
							// extract data, make compatibility with knockoutjs observables:
							data = (_d) ? 
								((typeof _d.peek === 'function') ? _.peek() : ((typeof _d === 'function') ? _d() : _d))
								: void(0),

							mappedMethod = assertDefined(self._methodsMap[verb], 
								'Verb \"'+verb+'\" is not supported by transport '+self.__tname),

							o = _.extend({}, self.options(), rqOptions, {'data': data}),

							qryArgs = popAttr(o, 'qryArgs'),

							uri = self._resolveUri(urn, qryArgs, o);

						// validate data type:
						assertType(data, self._accepts, 
							'Invalid type of rqOptions.data: '
							+ (typeof data)
							+ '\nTypes allowed: '+ self._accepts.join(","));

						return self._request(mappedMethod, uri, o).then(function (rspData) {
							return self._decodeData(rspData)
						})
					} catch (e) {
						return Promise.reject(e)
					}
				},

				/**
				 * Names of JS types, allowed for the request data (e.g.: 'string', 'object', 'number', ...)
				 * @method
				 * @param  {array of string} value Enumeration of accepted types
				 * @return {self, array}       The transport instance itself (when called with argument), othewise - the current settings
				 */
				'accepts': function (value) {
					if (typeof value === 'undefined') return self._accepts;
					self._accepts = value;
					return self; // for chaining
				},

				// read-only property:
				'url': function() { return self._url },

				/**
				 * Renders the actual URI from template (adding the )
				 * @method
				 * @param  {string} urn       URN for request
				 * @param  {object} qryArgs  Map of "query" arguments (not used here, can be used in descendants). By default, this part is processed by Transport objects (E.g., HTTP transport uses it for the query part of URI, like '...?argName=value&...')
				 * @param  {[type]} rqOptions Request options
				 * @return {string}           Actual URI (the complete path, like: "url"+/+"urn"+[optional query])
				 */
				'_resolveUri': function (urn, qryArgs, rqOptions) {
					var 
						_location = self._url.replace(/[\/]+$/g, ''),
						_urn = urn.replace(/^[\/]+/g, '');
					if (qryArgs) {
						_urn = [_urn, '?', serializeUriVariables(qryArgs)].join('')
					}
					console.log('_path-->', _urn);
					return self._escapePath([_location, '/',_urn].join(''));
				},

				/**
				 * Default settings for this transport (can be overriden with options, specified for request)
				 * @method
				 * @param  {object} value Options in form "key": "value"
				 * @return {self, object}       The transport instance itself (when called with argument), othewise - the current settings
				 */
				'options': function (value) {
					if (typeof value === 'undefined') return self._options;
					extendOptions(self._options, assertType(value, _.isObject), 'Transport.options error');
					return self;
				},

				/**
				 * Object which maps "CRUD" verbs to methods, e.g.: 'create'->'POST', ...
				 * @method
				 * @param  {object} valsHash Mapping
				 * @return {self, object}       The transport instance itself (when called with argument), othewise - the current settings
				 */
				'methodsMap': function (valsHash) {
						if (typeof valsHash === 'undefined') return _.copy(self._methodsMap);
						assertType(valsHash, 'object', 'Transport.methodsMap error');
						//allow to map only predefined verbs:
						var unknownArgs = _.difference(
							_.keys(valsHash), 
							['create','read','update','delete','query']);
						if(unknownArgs.length>0)
							throw new Error('methodsMap error: Unknown verb(s): '+unknownArgs.join(','));
						//allow to use only existing methods:
						var unknownMethods = _.difference(_.values(valsHash), _.keys(self));
						if(unknownMethods.length>0)
							throw new Error('methodsMap error: Unknown methods(s): '+unknownMethods.join(','));
						_.extend(self._methodsMap, valsHash);
						return self; // for chaining
					},

				/**
				 * Type of the request data, acceptable for back-end (default: 'js-object')
				 * @method
				 * @param  {string} value Mnemonic typename, one of: 'json', 'xml', 'text', 'form', 'js-object'. "json", "xml" means serialized representation (as string), while "js-object" means a javascript object (typeof data === 'object').
				 * @return {self, string}       The transport instance itself (when called with argument), othewise - the current settings
				 */
				'encodeTo': function(value) {
						if (typeof value === 'undefined') return self._encodeTo;
						self._encodeTo = assertType(value, ['json', 'xml', 'text', 'form', 'js-object'], 'Transport.encodeTo error');
						return self; // for chaining
					},

				/**
				 * Type of the response data which back-end returns  (default: 'js-object')
				 * @method
				 * @param  {string} value Mnemonic typename, one of: 'json', 'xml', 'text', 'form', 'js-object'. "json", "xml" means serialized representation (as string), while "js-object" means a javascript object (typeof data === 'object').
				 * @return {self, string}       The transport instance itself (when called with argument), othewise - the current settings
				 */
				'decodeFrom': function(value) {
						if (typeof value === 'undefined') return self._decodeFrom;
						assertTrue(['json', 'xml', 'text', 'form', 'js-object'].indexOf(value)>-1, 'Transport.decodeFrom error: invalid type: '+value)
						self._decodeFrom = value;
						return self; // for chaining
					},

				/**
				 * Converts the request data to format, acceptable for back-end (in accordance with .encodeTo settings)
				 * @method
				 * @param  {any} data      Optional data for request
				 * @param  {object} rqOptions Request options
				 * @return {any}           Converted data
				 */
				'_encodeData': function(data, rqOptions) {
					// Code 400: http code "400 Bad Request"
					function EncodeError(message) {
						throw new EncodeErrorClass(message, {code: 400});
					}

					assertType(data, self._accepts, 
						'Cannot perform request: invalid data type: ' + typeof data);
					
					if (typeof data === 'undefined') return;

					switch (self._encodeTo) {
						case 'js-object':
							return _.isObject(data) ? data : EncodeError('cannot encode "string" as "js-object"');
						case 'json':
							return JSON.stringify(data);
						case 'text':
							return _.isString(data) ? data : EncodeError('cannot encode data to "text"');
						case 'form':
							// To-do: encodeData->form
							EncodeError('encodeData->form not implemented');
						case 'xml':
							// To-do: encodeData->xml  
							EncodeError('encodeData->xml not implemented');
					}
				},

				/**
				 * Converts the response data to format, acceptable for application (in accordance with .decodeFrom settings)
				 * @method
				 * @param  {any} data      Optional data for request
				 * @return {any}           Converted data
				 */
				'_decodeData': function (data) {
					// Code 406: http code "Not Acceptable"
					function DecodeError(message) {
						throw new DecodeErrorClass(message, {code: 406});
					}

					var 
						dType = typeof data,
						isStr = dType === 'string',
						isObj = dType === 'object';

					// Allow undefined as a partial case?
					if (dType === 'undefined') return data;

					switch (self._decodeFrom) {
						case 'text':
							return (isStr) ? data : DecodeError('cannot interpret "'+dType+'" as expected "text"');
						case 'js-object': 
							return (isObj) ? data : DecodeError('cannot interpret "'+dType+'" as expected "js-object"');
						case 'json': 
							return (isStr) ? JSON.parse(data) : ('cannot interpret "'+dType+'" as expected "json"')
						case 'xml':
							DecodeError('decodeData for "xml" not implemented');
						default:
							DecodeError('No conversion defined for: '+self._decodeFrom+' from: '+dType);
					}
				},

				/**
				 * Low-level method (invockable from _dispatchRequest)
				 * @method
				 * @param  {string} method    Name of the request method (depends on the transport protocol)
				 * @param  {string} uri       Resolved URI to request
				 * @param  {object} rqOptions Options (optional) - redefines default settings for transport
				 * @return {Promise}           Promise object
				 */
				'_request': function(method, uri, rqOptions) {
					throw new Error('Not implemented')
				},

				'create': function(urn, rqOptions) {
					return self._dispatchRequest('create', urn, rqOptions)
				},

				'update': function(urn, rqOptions) {
					return self._dispatchRequest('update', urn, rqOptions)
				},

				'read': function(urn, rqOptions) {
					return self._dispatchRequest('read', urn, rqOptions)
				},

				'delete': function(urn, rqOptions) {
					return self._dispatchRequest('delete', urn, rqOptions)
				},

				'query': function(urn, rqOptions) {
					return self._dispatchRequest('read', urn, rqOptions)
				}

			});

		}


		// return exported namespace
		console.log('IO PASSED');
		return {
			endpoint: endpoint,
			Transport: Transport,
			transport: transport,

			service: service,

			BaseError: BaseError,
			AuthError: AuthError,
			ArgumentError: ArgumentError,
			RequestError: RequestError,

			// Utils:
			extendOptions: extendOptions
		};


	}));
