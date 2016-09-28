//io.middleware.js

// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		if (typeof IO === 'undefined')
			throw new Error('Reqires IO module!');
		MODULES.io_middleware = modfunc(
			_, 
			IO,
			MODULES.endpointscfg,
			MODULES.config
			);
		IO = MODULES.io_middleware;
	}
}


define([
	'underscore.all', 
	'shared/io', // <--  
	'shared/EndpointsCfg',
	'shared/config',

	'shared/io.firebase'
], 

function (_, IO, endpoints, config) {

	// self._url_ = function(path, StorageID){
	// 	return (StorageID != null) ? path + '/' + StorageID.toLowerCase() : path; // to-do: resolve to abs url
	// };
	// ep->transport->request.

	var extendOptions = IO.extendOptions;

	// MediaService.dataStorage = IO.Transport.factory(config.storages.db, {});
	// console.log('MediaService.dataStorage', MediaService.dataStorage._tname);
	// MediaService.mediaStorage = IO.Transport.factory(config.storages.media, {});
	// console.log('MediaService.mediaStorage', MediaService.mediaStorage._tname);

	function MediaService(urn, opts) {
		var self = IO.service(urn, opts);

		self._srvMedia = IO.service(urn, opts);

		self.setDefaultTransports = function () {
			var 
				// data storage (db):
				// _ds = MediaService.dataStorage,
				_ds = IO.Transport.factory(config.storages.db, {}),
				// media storage:
				// _ms = MediaService.mediaStorage;
				_ms = IO.Transport.factory(config.storages.media, {});

			// Set main transport
			self.transport(_ds);
			self._srvMedia.transport(_ms);

			_ds.init(config.storages.config);
			_ms.init(config.storages.config);

			console.log('_ds', _ds);
			console.log('_ms', _ms);

			return self; // chaining
		}

		// It is sufficient to auth only in one service when using Firebase:
		// _ds.signIn({email:'d_z@mail.ru', password:'passwd'})
		// 	.then(function (result) {
		// 		// success:
		// 		console.log('Done: ', result);
		// 		return result;
		// 	})
		// 	.catch(function (reason) {
		// 		console.warn('??? Auth: ', reason);
		// 		return reason;
		// 	})



		return _.extend(self, {

			'mediaStorage': function (value) {
				if (typeof value === 'undefined') return self._srvMedia.transport();
				self._srvMedia.transport(value);
				return self;
			},
			// alias:
			'dataStorage':self.transport,

			'createBlob': function (key, file, metadata, rqOptions) {
				console.log('Marking metadata...: ', key, metadata, rqOptions);
				console.log('TRANSPORT', self.transport()._tname);
				return self.saveModel(key, {'status': 'loading'}, rqOptions)
					.then(function (response) {
						console.log('******* 1 ********', response);
						return response
					})
					.then(function (response) {
						var 
							data = _.extend({}, metadata, {'uploadData': file});
						console.log('Uploading...: ', key, data, rqOptions);
						return  self._srvMedia.saveModel(key, data, rqOptions);
					})
					.then(function (response) {
						console.log('******* 2 ********', response);
						return response
					})
					.then(function (response) {
						var 
							m = response,
							newMd = _.extend(metadata || {}, {
								 'status': 'ok'	
								,'contentType': m.contentType || null
								,'contentLanguage': m.contentLanguage || null
								,'cacheControl': m.cacheControl || null
								,'customMetadata': m.customMetadata || null // {clientFileName, }

								,'fileName': m.fileName || null
								,'url': m.url || null // metadata.downloadURLs[0]
								,'size': m.size || null
								,'created': m.created || null
								,'updated': m.updated || null
								,'md5Hash': m.md5Hash || null
							});
						console.log('Updating metadata...: ', key, newMd, rqOptions);
						return self.updateModel(key, newMd, rqOptions);
					})
					.then(function (response) {
						console.log('******* 3 ********', response);
						return response
					})
			},

			'removeBlob': function (key, rqOptions) {
				return self._srvMedia.remove(key, rqOptions)
					.then(self.remove(key, rqOptions))
			}
		});
	}



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

	function Gateway(cfg) {
		var 
			_cfg = cfg || config,
			// data storage (db):
			_ds = IO.Transport.factory(_cfg.storages.db, {}).init(_cfg.storages.config),
			// media storage:
			_ms = IO.Transport.factory(_cfg.storages.media, {}).init(_cfg.storages.config);

		//------------- DEV LOGIN
 		// _ds.signIn({email:'d_z@mail.ru', password:'passwd'})
			// .then(function (result) {
			// 	// success:
			// 	console.log('Auth OK: ', result);
			// 	return result;
			// })
			// .catch(function (reason) {
			// 	alert(reason.toString());
			// 	console.warn('??? Auth Error: ', reason);
			// 	return reason;
			// })
		
		//-------------

		var self = {
			_services: {
				'Assets': MediaService('assets').dataStorage(_ds).mediaStorage(_ms),
				'Channels': MediaService('channels').dataStorage(_ds).mediaStorage(_ms),
				'Playlists': MediaService('playlists').dataStorage(_ds).mediaStorage(_ms),
				'Devices': MediaService('devices').dataStorage(_ds).mediaStorage(_ms)
			},
			_get: function (eName) {
				return _.assertDefined(self._services[eName],
					'Cannot find service for entity: '+eName)
			}
		};

		return _.extend(self, {
			'signIn': function () {
				// DEV only
				return _ds.signIn({email:'d_z@mail.ru', password:'passwd'})
			},

			'signOut': function () {
				return _ds.signOut()
			},

			'createBlob': function (entity, key, file, metadata, rqOptions) {
				return self._get(entity).createBlob(key, file, metadata, rqOptions)
			},

			'removeBlob': function (entity, key, rqOptions) {
				return self._get(entity).removeBlob(key, rqOptions);
			},

			'loadCollection': function (entity, setter, itemFactory, rqOptions) {
					return self._get(entity).loadCollection(setter, itemFactory, rqOptions) 
				},
			'saveCollection': function (entity, jsArray, rqOptions) {
					return self._get(entity).saveCollection(jsArray, rqOptions) 
				},
			'load': function (entity, key, model, rqOptions) {
					return self._get(entity).loadModel(key, model, rqOptions) 
				},
			'save': function (entity, key, model, rqOptions) {
					return self._get(entity).saveModel(key, model, rqOptions) 
				},
			'update': function (entity, key, model, rqOptions) {
					return self._get(entity).updateModel(key, model, rqOptions) 
				},
			'remove': function (entity, key, rqOptions) {
					return self._get(entity).remove(key, rqOptions) 
				}
		});
	}

	return _.extend(IO, {
		'MediaService': MediaService,
		'Gateway': Gateway});
});