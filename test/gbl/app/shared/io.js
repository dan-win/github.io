/*
// 
// Framework for integration with server API
// Copyright D.Zimoglyadov.
// License: MIT (free for all kind of projects)
//
*/

// IO base classes and Ajax tools
(function (root, factory) {
	var _modname = 'IoEntities';
    if (typeof define === "function" && define.amd) { // AMD mode
        define(["jquery", "json2"], factory);
    } else if (typeof exports === "object") { // CommonJS mode
        module.exports = factory(require("jquery"), require("json2"));
    } else {
        root[_modname] = factory(root.$, root.JSON); // Plain JS, "rtl" is in window scope
    }
}(this, function ($) {
	// body...

	var IO = {

			getQueryVariable: function (variable) {
				var query = window.location.search.substring(1);
				var vars = query.split("&");
				for (var i=0; i<vars.length; i++) {
					var pair = vars[i].split("=");
					if (pair[0] == variable) {
						return decodeURIComponent((pair[1]+'').replace(/\+/g, '%20'));
					}
				}
				return null;
			}

	};

	// var DEST_REQUIRED = {'GET': true, 'HEAD': true};
	// var SRC_REQUIRED = {'POST': true, 'PUT': true};
	var METHODS = {'GET':1, 'POST':1, 'PUT':1, 'HEAD':1, 'DELETE':1};

	function isFunction (v) {
		return typeof v == 'function';
	}

	function isNull (v) {
		return v === null;
	}

	IO.EndpointBindingFactory = function Factory (endpointName) {
		
		var self = {
			_name : endpointName || '',
			_json: true,
			_method : 'GET', 
			_requestData : null, // <function () > returns data for request
			_responseData : null, // <function (result)> extracts data from response
			_onError : null,

			// arguments in sequence: /arg1/arg2/.../
			argNames: [],
			// allowed arguments:
			argAllowed: {},

			request : function (transport, args, vars) {
				// returns promise:
				return transport.request(self, args, vars);
			},
		};

		self.name = function (name) {
			if (typeof name == 'undefined') return self._name;
			self._name = name;
			return self;
		}

		self.json = function (flag) {
			if (typeof flag == 'undefined') return self._json;
			self._json = flag;
			return self;
		}

		self.method = function (method) {
			// getter:
			if (typeof method == 'undefined') return self._method;
			// setter:
			method = method.toUpperCase();
			if (!(METHODS[method]))
				throw 'Invalid http method: ' + method;
			self._method = method;
			return self; // for chaining
		}

		self._done = function (data) {
			// for promise handler .done()
			if (self._responseData) self._responseData(data);
		}

		self.requestData = function (requestData) {
			if (typeof requestData == 'undefined') return self._requestData;
			if (isFunction(requestData) || isNull(requestData)) {
				self._requestData = requestData;
				return self; // for chaining
			}
			throw 'Endpoint.requestData must be a function or a null, passed value has a type: ' + typeof requestData;
		}

		self.responseData = function (responseData) {
			if (typeof responseData == 'undefined') return self._responseData;
			if (isFunction(responseData) || isNull(responseData)) {
				self._responseData = responseData;
				return self; // for chaining
			}
			throw 'Endpoint.responseData must be a function or a null, passed value has a type: ' + typeof responseData;
		}

		self.onError = function (onError) {
			if (typeof onError == 'undefined') return self._onError;
			if (isFunction(onError) || isNull(onError)) {
				self._onError = onError;
				return self; // for chaining
			}
			throw 'Endpoint.onError must be a function or a null, passed value has a type: ' + typeof onError;
		}

		// Process args:
		var tags = endpointName.split('/');
		for (var i=0, tag; i<tags.length; i++) {
			tag = tags[i];
			if (':' == tag.charAt(0)) {
				// remove leading ":" :
				tag = tag.substring(1);
				// add to list:
				self.argNames.push(tag);
				// add to allowed set:
				self.argAllowed[tag] = true;
			}
		}

		// // *** validation ***
		// if (SRC_REQUIRED[self.method] && !self.requestData) 
		// 	throw 'Error: dataOrigin required for "'+self.method+'" method';

		// if (DEST_REQUIRED[self.method] && !self.responseData) 
		// 	throw 'Error: dataDest required for "'+self.method+'" method';

		// if (self.requestData && (typeof self.requestData != 'function')) 
		// 	throw 'requestData must be a function'

		// if (self.responseData && (typeof self.responseData != 'function'))
		// 	throw 'responseData must be a function'

		return self; 

	}


	IO.TransportFactory = function (root, options) {
		// body...
		var self = {
			_root: root || '',
			_onError: function error (connObject, message, error) {
				// jqXHR, textStatus, errorThrown
				console.error('IO Error: ' , error, '; ', message, '; ', connObject);
			}
		};

		self.root = function (root) {
			if (typeof root == 'undefined') return self._root;
			self._root = root;
			return self; // for chaining
		}

		self.onError = function (onError) {
			if (typeof onError == 'undefined') return self._onError;
			if (isFunction(onError) || isNull(onError)) {
				self._onError = onError;
				return self; // for chaining
			}
			throw 'Transport.onError must be a function or a null, passed value has a type: ' + typeof onError;
		}

		self.resolveUrl = function (endpoint, args, vars) {
			var endpointName = endpoint._name;
			function smartJoin (s1, s2) {
				return (s1 + ((s2.charAt(0)=='/') ? '' : '/' ) + s2).replace('//', '/');
			}
			function addVars (url, vars) {
				if (!vars) return url;
				var query = [];
				for (var name in vars) {
					query.push([name, vars[name]].join('='))
				};
				return [url, query.join('&')].join('?');
			}

			// validate arguments:
			if (vars && typeof vars != 'object') {
				throw ' "vars" must be an object! ';
			}

			if (args) {

				if (typeof args != 'object') throw ' "args" must be an object !';

				// Check that no extra arguments:
				for (var name in args) {
					if (!(name in endpoint.argAllowed)) {
						throw 'Argument \"'+ name +'\" now allowed for: ' + endpointName;
					}
				}

				for (var i=0, _aName = endpoint.argNames[i]; i<endpoint.argNames.length; i++) {
					if (!(_aName in args)) {
						throw 'Required argument \"'+_aName+'\" missed!';
					}
					endpointName = endpointName.replace(':'+_aName, args[_aName]);
				}
			}


			endpointName = addVars(smartJoin(self._root, endpointName || ''), vars);

			// if (self._root.length > 0 && endpointName.length > 0) {
			// 	return self._root + ((endpointName.charAt(0)=='/') ? '' : '/' ) + endpointName;
			// }

			console.log('requesting url: ', endpointName);

			return endpointName;
		}

		self.request = function (endpoint, args, vars) {
			throw 'Not implemented';
		}

		return self;
	}

	IO.HttpTransportFactory = function (root, jqAjaxSettings) { // jQuery ajax settings
		var self = IO.TransportFactory(root);
		self._headers = null;
		// var dataOrigin, dataDest, opts, done, fail;
		var transportSettings = $.extend({
				'timeout': 30*1000, //
				// -- data format in exchange with server (now is text, to-do: support json)
				// 'contentType': 'text/plain', // 
				// 'dataType': 'json', // <-- data expected from server text or json?
				'crossDomain': true,
			}, jqAjaxSettings || {});

		self.headers = function (value) {
			if (typeof value == 'undefined') return self._headers;
			self._headers = value;
			return self;
		}


		var _ajax = function (endpoint, args, vars) {
			// body...
			var settings = {
				'method' : endpoint._method,
				'cache' : !(endpoint._method == 'GET' || endpoint._method == 'HEAD'),
			};

			if (endpoint._json) {
				settings['dataType'] = 'json';
				settings['processData'] = false;
				settings['data'] = (endpoint._requestData) ? JSON.stringify(endpoint._requestData()) : null;
				settings['contentType'] = 'application/json; charset=utf-8';
			} else {
				settings['data'] = (endpoint._requestData) ? endpoint._requestData() : null;
			}

			if (self._headers) settings['headers'] = self._headers;

			return $.ajax(url, options);
		}

		self.request = function (endpoint, args, vars) {

			return $.Deferred(function(def){
				var 
					url = self.resolveUrl(endpoint, args, vars),
					options = $.extend({}, transportSettings, settings);
				_ajax(endpoint, args, vars)
					.done(function (data) {
						endpoint._done(data);
						// deferred: resolve
						def.resolve(data, def); 
					})
					.fail(function (jqXHR, textStatus, errorThrown) {
						var method = endpoint._onError || self._onError;
						method(jqXHR, textStatus, errorThrown);
						// deferred: reject
						def.reject({"message": jqXHR.responseText}, textStatus, jqXHR.statusCode());
					});
			
			// return promise:
			}).promise();

		}

		self.requestAny = function (epArray, args, vars) {
			// return the first successfull request
			// do not pass endpoints with assigned onError;

			return $.Deferred(function(def){
				var 
					attempts = epArray.length - 1,
					successfull = false; 

				// fire parallel requests:
				for (var i=0; i < epArray.length; i++) {

					_ajax(epArray[i], args, vars)
						.done(function (data) {

							// ignore repeated ".done":
							if (successfull) return;

							successfull = true;

							endpoint._done(data);
							// deferred: resolve
							def.resolve(data, def);

						})
						.fail(function (jqXHR, textStatus, errorThrown) {

							// ignore failure if attempts remains or result already received
							if (successfull || attempts) {
								attempts--; 
								return; 
							};

							var method = endpoint._onError || self._onError;
							method(jqXHR, textStatus, errorThrown);
							// deferred: reject
							def.reject({"message": jqXHR.responseText}, textStatus, jqXHR.statusCode());
						});

				}

			// return promise:
			}).promise();

// +++++++++++++++++


		}

		// return instance
		return self;
	}

	// return exported namespace
	return IO;


}));