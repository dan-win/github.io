//io.middleware.js
define([
	'underscore.all', 
	'jquery', 
	'knockout.all', 
	'shared/io.extended', // <-- with Local storage capablities 
	'shared/EndpointsCfg',
	'shared/config' 
], 

function (_, $, ko, IO, endpoints, config) {

	// self._url_ = function(path, StorageID){
	// 	return (StorageID != null) ? path + '/' + StorageID.toLowerCase() : path; // to-do: resolve to abs url
	// };

 
	var IoMiddleware = function () {
		var 
			self = this,

			storageType = _.assertDefined(config.storageType, 
				'IoMiddleware config error: storageType is undefined!'),
			storagePrefix = _.assertDefined(config.storagePrefix, 
				'IoMiddleware config error: storagePrefix is undefined!'),
			tags = storageType.split(':'),
			transport = null,
			handleError = null;

		storageType = storageType.toLowerCase();

		switch (tags[0]) {
			case 'local':
				transport = IO.LocalStorageFactory(storagePrefix, config);
				break;
			case 'http':
				transport = IO.HttpTransportFactory(storagePrefix, config);
				break;
			default:
				throw new Error('Invalid "storageType" in "config:"'+storageType);
		}

		handleError = function (connObject, message, error) {
			console.log('Io Error: ', connObject, message, error);
		}

		// self.enum <- not implemented
		self.loadCollection = function (entity, setter, itemClass) {
			// get entire tree of objects where root object is entity

			// sample: GET /assets/all
			// without StorageID

			// returns promise

			return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['loadCollection']
				.responseData(function (data) {
					console.log('response data: ', data);
					setter(
						_.map(data || [], function (itemData) {
							console.log('Loading item: ', itemData);
							return new itemClass(itemData);
						})
					);
				})
				.onError(handleError)
				.request(transport);
			}

		self.saveCollection = function (entity, jsArray) {
			var 
				source = (typeof jsArray == 'function' ? jsArray() : jsArray),
				buffer = _.map(source, function (item) {
					if (!item.toJS) console.log('!!! item has no toJS method:', item);
					return (item.toJS) ? item.toJS() : item;
				});

			console.log('saveCollection: ', buffer);

			// returns promise

			return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['saveCollection']
				.requestData(function () {return buffer}) // <-- requestData requires "callable" object, so pass function instead of value
				.onError(handleError)
				.request(transport);
			}

		self.load = function (entity, key, model) {
			// refreshes existing object
			// Note: model must be instantiate before
			// model must support "updateValues" method

			// sample: GET /assets/001

			// returns promise

			_.assertDefined(model, 'IO.load error: target model must be instantiated before load!');

			return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['load']
				.responseData(function(data) {
					model.updateValues(data);
				})
				.onError(handleError)
				.request(transport, {'key': key});

			}

		// store data for existing item
		self.save = function (entity, key, model) {
			// sample: POST /assets/001
			// returns promise

			_.assertDefined(model, 'IO.load error: target model must be instantiated before save!');

			return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['save']
				.requestData((model.toJS) ? model.toJS : function () {return model}) // <-- requestData requires "callable" object, so pass function instead of value
				.onError(handleError)
				.request(transport, (key) ? {'key': key} : null);
			}

		// store new item:
		self.saveas = self.save;

		self.remove = function (entity, key) {
			// sample: DELETE /assets/001
			// returns promise

			_.assertDefined(model, 'IO.load error: target model must be instantiated before save!');

			return _.assertDefined(endpoints[entity], 'No endpoints defined for: '+entity)['remove']
				.onError(handleError)
				.request(transport, {'key': key});
			}

	}


	return IoMiddleware; // returns IoMiddleware class
});