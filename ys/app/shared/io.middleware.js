//io.middleware.js

(function(root, factory) {
	// var _modname = 'IO';
	if (typeof define === "function" && define.amd) { // AMD mode
		define(["underscore.all", "shared/io"], factory);
	} else if (typeof exports === "object") { // CommonJS mode
		var _ = (typeof window._ === 'undefined') ? require("underscore.all") : window._;
		var IO = (typeof window.IO === 'undefined') ? require("shared/io") : window.IO;
		module.exports = factory(_, IO);
	} else {
	// This module extends "IO" (which already exists as a global variable)
		factory(root._, root.IO); // Plain JS, "rtl" is in window scope
		// root[_modname] = factory(root._, root.IO, root.firebase); // Plain JS, "rtl" is in window scope
	}
}(this, function(_, IO) {
//=========================

// // STUB FOR DEBUGGING
// if (typeof define !== "function" || !define.amd) {
// 	define = function (ignore, modfunc) {
// 		if (typeof IO === 'undefined')
// 			throw new Error('Reqires IO module!');
// 		MODULES.io_middleware = modfunc(
// 			_, 
// 			IO,
// 			MODULES.endpointscfg,
// 			MODULES.config
// 			);
// 		IO = MODULES.io_middleware;
// 	}
// }


// define([
// 	'underscore.all', 
// 	'shared/io', // <--  
// 	'shared/config',

// 	'shared/io.firebase'
// ], 

// function (_, IO, config) {

	// self._url_ = function(path, StorageID){
	// 	return (StorageID != null) ? path + '/' + StorageID.toLowerCase() : path; // to-do: resolve to abs url
	// };
	// ep->transport->request.

	var 
		mandatory = _.assertDefined;


	/**
	 * Bundle of transport and endpoint.
	 * Final object, for instantiation only (not for inheritance)
	 * @method Service
	 * @param  {Endpoint} endpoint       [description]
	 * @param  {Transport} transport [description]
	 * @return {object}           [description]
	 */
	function Service (endpoint, transport) {
		var 
			self = {
				'endpoint': mandatory(endpoint, 'Service requires defined "endpoint"'), 
				'transport': mandatory(transport, 'Service requires defined "transport"')
			};
		console.log('Service has transport: ', transport);

		return _.extend(self, {
			'signIn': function (args) {
				// DEV only !!!
				args = {email:'d_z@mail.ru', password:'passwd'}
				return self.transport.signIn(args)},

			'signOut': function (args) {return self.transport.signOut()},

			'child': function (urn) {
				return Service(self.endpoint.child(urn), self.transport)},

			'create': function(rqOptions, data) {
				return self.endpoint.create(self.transport, rqOptions, data)},

			'update': function(rqOptions, data) {
				return self.endpoint.update(self.transport, rqOptions, data)},

			'read': function(rqOptions) {
				return self.endpoint.read(self.transport, rqOptions)},

			'delete': function(rqOptions) {
				return self.endpoint.delete(self.transport, rqOptions)},

			'query': function(rqOptions) {
				return self.endpoint.query(self.transport, rqOptions)}
		})
	}


	/**
	 * Works with collections represented in form "key: object"
	 * @method CollectionInterface
	 * @param  {[type]}            svc [description]
	 */
	function CollectionInterface(svc) {
		var self = {
			_svc: mandatory(svc, 'CollectionInterface error: cannot create instance, "svc" is not defined')
		}
		return _.extend(self, {

			'signIn': function (args) {return self._svc.signIn(args)},
			'signOut': function (args) {return self._svc.signOut()},

			'enum': function (rqOptions) {
				return self._svc.read(rqOptions)
			},

			'load': function (key, rqOptions) {
				mandatory(key, 'IO.load error: key is undefined!');
				return self._svc.child(key).read(rqOptions)
			},

			'save': function (key, data, rqOptions) {
				mandatory(key, 'IO.save error: key is undefined!');
				mandatory(data, 'IO.save error: data is undefined!');
				return self._svc.child(key).create(rqOptions, data)
			},

			'update': function (key, data, rqOptions) {
				mandatory(key, 'IO.update error: key is undefined!');
				mandatory(data, 'IO.update error: data is undefined!');
				return self._svc.child(key).update(rqOptions, data)
			},

			'remove': function (key, rqOptions) {
				return self._svc.child(key).delete(rqOptions)
			}

		})
	}

	// To work with a custom Object - instantiate ObjectReflection
	// and setup main methods
	// To implement template - instantiate with ObjectReflection(null),
	// setup main methods, and further clone reflection by ".wrap(service))"
	function ObjectReflection(svc) {
		var self = {
			_parent: CollectionInterface(svc),
			// properties with default values:
			_methods: {
				// encode object:
				toJS: function (obj) {return obj},
				// update object attrs from data:
				fromJS: function (obj, data) {return _.extend(obj, data)},
				// instantiate object from data
				itemFactory: function (data) {return data},
				// define which field is the unique key for object
				// (return the value which identifies this instance of "obj" only!)
				makeKey: function (obj) {
					_.assertDefined(obj.StorageID, 'makeKey uses StorageID() attribute by default!')
					return obj.StorageID.peek()
				}
			}
		}; 

		var _newItem = function (data) {
			// decode data from stream and create new item instance
			var instance = self._methods.itemFactory()
			return self._methods.fromJS(instance, data)
		}

		return _.extend(self, {

			'wrap': function (service) {
				var newInstance = _.extend(
						ObjectReflection(service), 
						{_methods: self._methods})
				console.log('=>wrap', newInstance);
				return newInstance
			},
			/**
			 * Defines which field contains key: Extracts key value from object
			 * @method
			 * @param  {[type]} objItem [description]
			 * @return {[type]}         [description]
			 */
			// 'makeKeyValue': function (objItem) {return _.qGUID()},

			'toJS': function (method) {self._methods.toJS = method; return self},
			'fromJS': function (method) {self._methods.fromJS = method; return self},
			'itemFactory': function (method) {self._methods.itemFactory = method; return self},
			'makeKey': function (method) {self._methods.makeKey = method; return self},

			'enum': function (rqOptions) {
				return self._parent.enum(rqOptions).then(function (response) {
					// "Bless" objects if itemFactory returns new instance:
					// Use "map" instead of "mapObject" - create array instead
					// of collection because ID contained in objects themselves
					// (each object is unique by instance)
					console.log('Enumeration', response)
					return _.map(response, _newItem)
				})
			},
			'load': function (objItem, rqOptions) {
				var key = self._methods.makeKey(objItem);
				return self._parent.load(key, rqOptions).then(function (response) {
					return self._methods.fromJS(objItem, response)
				})
			},
			'save': function (objItem, rqOptions) {
				var key = self._methods.makeKey(objItem);
				console.log('---------toJS', self._methods.toJS(objItem), self._methods.toJS);
				return self._parent
					.save(key, self._methods.toJS(objItem), rqOptions)
					// .then(function () {return objItem})
			},
			'update': function (objItem, rqOptions) {
				var key = self._methods.makeKey(objItem);
				return self._parent
					.update(key, self._methods.toJS(objItem), rqOptions)
					// .then(function () {return objItem})
			},
			'remove': function (objItem, rqOptions) {
				var key = self._methods.makeKey(objItem);
				return self._parent.remove(key, rqOptions)
			}
		})
	}

	// // TO-DO: Move that into "model-asset.js" module (?)
	// var AssetReflection = ObjectReflection(null);

	// AssetReflection.toJS(function (objItem) {
	// 	// convert to the common "upload" task data
	// 	var data = objItem.toJS() // <- IFUpdate.toJS() used
	// 	// translate Asset.uploadFile to the common 'uploadData' attribute
	// 	// and encode metadata
	// 	var uploadTask = {};
	// 	// [1] 'uploadData' (if any)
	// 	uploadTask['uploadData'] = objItem.uploadFile.peek();
	// 	// Note that "undefined" values will be ignored by default:)
	// 	// [2] 'matadata' - mandatory attribute with 1 mandatory field 'contentType'
	// 	uploadTask['metadata'] = {
	// 		'contentType': _popAttr(data.MimeType)

	// 		,'md5Hash': _popAttr(data.md5Hash) 	//string 	YES on upload, NO on updateMetadata
	// 		,'cacheControl': _popAttr(data.cacheControl) 	//string 	YES
	// 		,'contentDisposition': _popAttr(data.contentDisposition) 	//string 	YES
	// 		,'contentEncoding': _popAttr(data.contentEncoding) 	//string 	YES
	// 		,'contentLanguage': _popAttr(data.contentLanguage) 	//string 	YES
	// 		// These fields will be ignored in FirebaseStrorage
	// 		,'size': _popAttr(data.FileSize)
	// 		}; //<- at least: contentType
	// 	// [3] - 'customMetadata' - all user-defined data
	// 	uploadTask['customMetadata'] = data
	// 	return uploadTask
	// });

	// AssetReflection.fromJS(function (objItem, response) {
	// 	// decode metadata
	// 	// note that the CDN server can return additional and changed values so update object to appropriate status!
	// 	var _srvMd = response.metadata;
	// 	// Unwrap metadata, and map known fields:
	// 	var data = _.extend({}, _srvMd, response.customMetadata || {}, {
	// 		'FileSize': _srvMd.size,
	// 		'Src': _srvMd.url,
	// 		'SrvFileName': _srvMd.fileName,
	// 		'CreatedTime': _srvMd.created,
	// 		'ModifiedTime': _srvMd.updated,
	// 		'MimeType': _srvMd.contentType
	// 		/* Field('StorageID'), 
	// 		*  Field('CreatedTime'), 
	// 		*  Field('ModifiedTime'): */ 
	// 	});
	// 	objItem.updateValues(data) // <- IFUpdate.updateValues() used
	// 	return objItem
	// });

	// AssetReflection.itemFactory(function (data) {
	// 	return new Asset(data) // <--- Redefine that before actual call - here Asset is not defined
	// });

	// AssetReflection.makeKey(function (objItem) {
	// 	var
	// 		fileName = objItem.FileName.peek(), 
	// 		fileExt = fileName.match(/\./gi) ? fileName.split('.').pop() : objItem.MimeType.peek().split('/').pop();
	// 	return [objItem.StorageID.peek(), fileExt].join('.')
	// });

	/**
	 * MultiMediaDispatcher supports Transport protocol (CRUD)
	 * @method MultiMediaDispatcher
	 * @param  {[type]}             dataTransport [description]
	 * @param  {[type]}             blobTransport [description]
	 */
	function MultiMediaDispatcher(dataTransport, blobTransport) {
		var self = {
			dataTransport: mandatory(dataTransport, 'MultiMediaDispatcher error: "dataTransport" is not defined'),
			blobTransport: mandatory(blobTransport, 'MultiMediaDispatcher error: "blobTransport" is not defined')
		};

		return _.extend(self, {
			'signIn': function (args) {
				return self.dataTransport.signIn(args)
					.then(function (result) {
						return self.blobTransport.signIn(args)
					})
			},
			'signOut': function () {
				// body...
			},
			'create': function(urn, rqOptions, data) {
				// Here data can contain 'uploadData' attribute which is a BLOB to upload
				// another fields are metadata attributes?
				var file = data.file;
				var metadata = data.metadata;
				mandatory(data.uploadData, 'The upload task requires "uploadData" attribute in "data"!')
				mandatory(data.metadata, 'The upload task requires "metadata" attribute which defines hosting rules for media')
				data.customMetadata = data.customMetadata || {};

				return self.dataTransport.create(urn, rqOptions, {'customMetadata': {'status': 'loading'}})

					.then(function (response) {
						console.log('******* 1 ********', response);
						return response
					})

					.then(function (response) {
						console.log('Uploading...: ', urn, data, rqOptions);
						return  self.blobTransport.create(urn, rqOptions, data)
					})

					.then(function (response) {
						console.log('******* 2 ********', response);
						return response
					})

					.then(function (response) {
						// Update initial data:
						data = _.extend({}, data, response);
						// mark upload as successful:
						data.customMetadata['status'] = 'ok';
						console.log('Updating metadata...: ', urn, data, rqOptions);
						return self.dataTransport.update(urn, rqOptions, data);
					})
					.then(function (response) {
						return data; // <--- !!! after successful update: return updated data!
					})
			},

			'update': function(urn, rqOptions, data) {
				function updateDataStorage() {
					return self.dataTransport.update(urn, rqOptions, data)
				}
				// route metadata between storages
				if (data.metadata) return self.blobTransport.update(urn, rqOptions, data).then(updateDataStorage); 
				return updateDataStorage()
			},

			'read': function(urn, rqOptions) {
				return self.dataTransport.read(urn, rqOptions)
			},

			'delete': function(urn, rqOptions) {
				// delete BLOB:
				return self.blobTransport.delete(urn, rqOptions)
					// delete metadata:
					.then(function () {self.dataTransport.delete(urn, rqOptions)})
			},

			'query': function(urn, rqOptions) {
				// route all queries to metadata storage only:
				return self.dataTransport.query(urn, rqOptions)
			}

		})		
	}

	// function MediaService(urn, opts, ctx) {
	// 	var self = IO.service(urn, opts, ctx);

	// 	self.factory = MediaService;

	// 	var _blobCtx = _.extend({}, ctx || {});
	// 	_blobCtx._transport = (ctx || {})._blobTransport;
	// 	self._BlobStorage = IO.service(urn, opts, _blobCtx);

	// 	self.setDefaultTransports = function () {
	// 		var 
	// 			// data storage (db):
	// 			// _dataTsp = MediaService.dataTransport,
	// 			_dataTsp = IO.Transport.factory(config.storages.db, {}),
	// 			// media storage:
	// 			// _blobTsp = MediaService.blobTransport;
	// 			_blobTsp = IO.Transport.factory(config.storages.media, {});

	// 		// Set main transport
	// 		self.transport(_dataTsp);
	// 		self._BlobStorage.transport(_blobTsp);

	// 		_dataTsp.init(config.storages.config);
	// 		_blobTsp.init(config.storages.config);

	// 		console.log('_dataTsp', _dataTsp);
	// 		console.log('_blobTsp', _blobTsp);

	// 		return self; // chaining
	// 	}

	// 	// It is sufficient to auth only in one service when using Firebase:
	// 	// _dataTsp.signIn({email:'d_z@mail.ru', password:'passwd'})
	// 	// 	.then(function (result) {
	// 	// 		// success:
	// 	// 		console.log('Done: ', result);
	// 	// 		return result;
	// 	// 	})
	// 	// 	.catch(function (reason) {
	// 	// 		console.warn('??? Auth: ', reason);
	// 	// 		return reason;
	// 	// 	})



	// 	return _.extend(self, {

	// 		'blobTransport': function (value) {
	// 			if (typeof value === 'undefined') return self._BlobStorage.transport();
	// 			self._ctx._blobTransport = value;
	// 			self._BlobStorage.transport(value);
	// 			return self;
	// 		},
	// 		// alias:
	// 		'dataTransport':self.transport,

	// 		// use "saveModel(..., data, ...)?"
	// 		'createBlob': function (key, file, metadata, rqOptions) {
	// 			console.log('Marking metadata...: ', key, metadata, rqOptions);
	// 			console.log('TRANSPORT', self.transport()._tname);
	// 			return self.saveModel(key, {'status': 'loading'}, rqOptions)

	// 				.then(function (response) {
	// 					console.log('******* 1 ********', response);
	// 					return response
	// 				})

	// 				.then(function (response) {
	// 					var 
	// 						data = _.extend({}, metadata, {'uploadData': file});
	// 					console.log('Uploading...: ', key, data, rqOptions);
	// 					return  self._BlobStorage.saveModel(key, data, rqOptions);
	// 				})

	// 				.then(function (response) {
	// 					console.log('******* 2 ********', response);
	// 					return response
	// 				})

	// 				.then(function (response) {
	// 					var 
	// 						m = response,
	// 						newMd = _.extend(metadata || {}, {
	// 							 'status': 'ok'	
	// 							,'contentType': m.contentType || null
	// 							,'contentLanguage': m.contentLanguage || null
	// 							,'cacheControl': m.cacheControl || null
	// 							,'customMetadata': m.customMetadata || null // {clientFileName, }

	// 							,'fileName': m.fileName || null
	// 							,'url': m.url || null // metadata.downloadURLs[0]
	// 							,'size': m.size || null
	// 							,'created': m.created || null
	// 							,'updated': m.updated || null
	// 							,'md5Hash': m.md5Hash || null
	// 						});
	// 					console.log('Updating metadata...: ', key, newMd, rqOptions);
	// 					return self.updateModel(key, newMd, rqOptions);
	// 				})
	// 				.then(function (response) {
	// 					console.log('******* 3 ********', response);
	// 					return response
	// 				})
	// 		},

	// 		'removeBlob': function (key, rqOptions) {
	// 			return self._BlobStorage.remove(key, rqOptions)
	// 				.then(self.remove(key, rqOptions))
	// 		}
	// 	});
	// }



	// /**
	//  * Service which compatible with Asset model (by properties/protocol)
	//  * @method AssetReflection
	//  * @param  {[type]}     urn  [description]
	//  * @param  {[type]}     opts [description]
	//  */
	// function AssetReflection(svc) {
	// 	var _osvc = ObjectReflection(svc);

	// 	// redefine mekeKey:
	// 	_osvc.makeKey = function (objItem) {
	// 		return objItem.StorageID.peek()
	// 		var
	// 			fileName = objItem.FileName.peek(), 
	// 			fileExt = fileName.match(/\./gi) ? fileName.split('.').pop() : objItem.MimeType.peek().split('/').pop();
	// 		return [objItem.StorageID.peek(), fileExt].join('.')
	// 	}

	// 	var self = {};

	// 	return _.extend(self, {
	// 		'enum': _osvc.enum,
	// 		'enumObj': function (itemFactory, rqOptions) {
	// 			itemFactory = itemFactory || function (d) {return d};
	// 			return _osvc.enum(rqOptions).then(function (response) {
	// 				// "Bless" objects if itemFactory returns new instance:
	// 				return _.mapObject(response, itemFactory)
	// 			})
	// 		},
	// 		'load': function (objItem, rqOptions) {
	// 			return _osvc.load(key, rqOptions)
	// 		},
	// 		'save': function (objItem, rqOptions) {
	// 			var key = self.makeKey(objItem);
	// 			return _osvc.save(key, objItem, rqOptions)
	// 		},
	// 		'update': function (objItem, rqOptions) {
	// 			var key = self.makeKey(objItem);
	// 			return _osvc.update(key, objItem, rqOptions)
	// 		},
	// 		'remove': function (objItem, rqOptions) {
	// 			var key = self.makeKey(objItem);
	// 			return _osvc.remove(key, rqOptions)
	// 		}
	// 	})

	// 	self.createAsset = function (assetItem, rqOptions) {
	// 		// convert Asset to metadata:
	// 		var metadata = {
	// 			// These fields borrowed from Firebase Storage, not used now:
				
	// 			md5Hash 	string 	YES on upload, NO on updateMetadata
	// 			cacheControl 	string 	YES
	// 			contentDisposition 	string 	YES
	// 			contentEncoding 	string 	YES
	// 			contentLanguage 	string 	YES
	// 			customMetadata 	Object containing string->string mappings 	YES
				 
	// 			'contentType': assetItem.MimeType.peek() || null
	// 			// ,'contentLanguage': null
	// 			// ,'cacheControl': null
	// 			// ,'customMetadata': null // {clientFileName, }

	// 			// Ignored on Firebase but can be helpfull for another CDN servers:
	// 			// ,'fileName': m.fileName || null
	// 			// ,'url': m.url || null // metadata.downloadURLs[0]
	// 			// ,'size': m.size || null
	// 			// ,'created': m.created || null
	// 			// ,'updated': m.updated || null
	// 			// ,'md5Hash': m.md5Hash || null				
	// 		}
	// 		// Encode key with extension:
	// 		var assetKey = remoteFileName(assetItem);
	// 		return self.createBlob(assetKey, file, metadata, rqOptions).then(function (response) {
	// 			// to-do: use .updateValues from IFUpdate
	// 			var _srvMd = response || {}; // <- Firebase returns updated metadata, behaviour of another server can be different
	// 			// Update "key":
	// 			assetItem.StorageID();
	// 			assetItem.FileSize(_srvMd.size);
	// 			assetItem.SrvFileName(); 
	// 			assetItem.Src(_srvMd.url);
	// 		})
	// 	}
	// 	// Means "refresh" Asset from storage, but StorageID must be assigned before!
	// 	self.readAsset = function (assetItem, rqOptions) {
	// 		// Encode key with extension:
	// 		var assetKey = remoteFileName(assetItem);
	// 		// convert Asset to metadata
	// 		return self.loadModel(assetKey, model, rqOptions)
	// 	}
	// 	self.updateAsset = function (assetItem, rqOptions) {
	// 		// Encode key with extension:
	// 		var assetKey = remoteFileName(assetItem);
	// 		// convert Asset to metadata
	// 		return self.updateModel(assetKey, model, rqOptions)
	// 	}
	// 	self.removeAsset = function (assetItem, rqOptions) {
	// 		// Encode key with extension:
	// 		var assetKey = remoteFileName(assetItem);
	// 		return self.removeBlob(assetKey, rqOptions)
	// 	}

	// 	return self;
	// }


	// 	handleError = function (connObject, message, error) {
	// 		console.log('Io Error: ', connObject, message, error);
	// 	}

	// 	self.uploadMedia = function (entity, key, file, descriptor) {
	// 		// body...
	// 	}

	// 	self.removeMedia = function (entity, key) {
	// 		// body...
	// 	}

	// 	// self.enum <- not implemented
		// self.loadCollection = function (entity, setter, itemFactory) { 
	// 		// get entire tree of objects where root object is entity

	// 		// sample: GET /assets/all
	// 		// without StorageID

	// 		// returns promise

	// 		return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['loadCollection']
	// 			.responseData(function (data) {
	// 				console.log('response data: ', data);
	// 				setter(
	// 					_.map(data || [], function (itemData) {
	// 						console.log('Loading item: ', itemData);
	// 						return itemFactory(itemData);
	// 					})
	// 				);
	// 			})
	// 			.onError(handleError)
	// 			.request(transport);
	// 		}

		// self.saveCollection = function (entity, jsArray) {
	// 		var 
	// 			source = (typeof jsArray == 'function' ? jsArray() : jsArray),
	// 			buffer = _.map(source, function (item) {
	// 				if (!item.toJS) console.log('!!! item has no toJS method:', item);
	// 				return (item.toJS) ? item.toJS() : item;
	// 			});

	// 		console.log('saveCollection: ', buffer);

	// 		// returns promise

	// 		return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['saveCollection']
	// 			.requestData(function () {return buffer}) // <-- requestData requires "callable" object, so pass function instead of value
	// 			.onError(handleError)
	// 			.request(transport);
	// 		}

	// 	self.filterCollection = function (entity, filterObj) {
	// 		// body...
	// 	}

		// self.load = function (entity, key, model) {
	// 		// refreshes existing object
	// 		// Note: model must be instantiate before
	// 		// model must support "updateValues" method

	// 		// sample: GET /assets/001

	// 		// returns promise

	// 		_.assertDefined(model, 'IO.load error: target model must be instantiated before load!');

	// 		return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['load']
	// 			.responseData(function(data) {
	// 				model.updateValues(data);
	// 			})
	// 			.onError(handleError)
	// 			.request(transport, {'key': key});

	// 		}

	// 	// store data for existing item
		// self.save = function (entity, key, model) {
	// 		// sample: POST /assets/001
	// 		// returns promise

	// 		_.assertDefined(model, 'IO.load error: target model must be instantiated before save!');

	// 		return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['save']
	// 			.requestData((model.toJS) ? model.toJS : function () {return model}) // <-- requestData requires "callable" object, so pass function instead of value
	// 			.onError(handleError)
	// 			.request(transport, (key) ? {'key': key} : null);
	// 		}

	// 	// store new item:
	// 	self.saveas = self.save;

	// 	self.remove = function (entity, key) {
	// 		// sample: DELETE /assets/001
	// 		// returns promise

	// 		_.assertDefined(model, 'IO.load error: target model must be instantiated before save!');

	// 		return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['remove']
	// 			.onError(handleError)
	// 			.request(transport, {'key': key});
	// 		}


	// var defaultService = MediaService();
	// defaultService.transport();
	

	// alias endpoint (?)
	// alias transport (?) 'data'/'blob'/'mmedia'
	function connect(endpoint, transport, reflection) {
		var svc = Service(endpoint, transport);
		// Use a simple object reflection by default:
		reflection = reflection || ObjectReflection;
		reflection.wrap(svc);
		// signIn?
	}


	/*
	Gateway has:
	1. Transports (by alias)
	2. Endpoints (by alias/entity)
	3. Services (by alias/entity)
	Returns: services (by alias)
	 */
	

	return _.extend(IO, {
		'Service': Service,
		'CollectionInterface': CollectionInterface,
		'ObjectReflection': ObjectReflection,
		'MultiMediaDispatcher': MultiMediaDispatcher
	});

}));
