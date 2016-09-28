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
	'shared/io', // <-- with Local storage capablities 
	'shared/EndpointsCfg',
	'shared/config' 
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
		var 
			// data storage (db):
			// _ds = MediaService.dataStorage,
			_ds = IO.Transport.factory(config.storages.db, {}),
			// media storage:
			// _ms = MediaService.mediaStorage;
			_ms = IO.Transport.factory(config.storages.media, {})

		self._srvMedia = IO.service(urn, opts);

		// Set main transport
		self.transport(_ds);
		self._srvMedia.transport(_ms);

		_ds.init(config.storages.config);
		_ms.init(config.storages.config);

		console.log('_ds', _ds);
		console.log('_ms', _ms);

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
							newMd = _.extend({
								 'status': 'ok'	
								,'contentType': m.contentType
								,'contentLanguage': m.contentLanguage
								,'cacheControl': m.cacheControl
								,'customMetadata': m.customMetadata // {clientFileName, }

								,'fileName': m.fileName
								,'url': m.url // metadata.downloadURLs[0]
								,'size': m.size
								,'created': m.created
								,'updated': m.updated
								,'md5Hash': m.md5Hash
							}, metadata);
						console.log('Updating metadata...: ', key, newMd, rqOptions);
						return self.saveModel(key, newMd, rqOptions);
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
	// 	self.loadCollection = function (entity, setter, itemFactory) { 
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

	// 	self.saveCollection = function (entity, jsArray) {
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

	// 	self.load = function (entity, key, model) {
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
	// 	self.save = function (entity, key, model) {
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


	return _.extend(IO, {'MediaService': MediaService});
});