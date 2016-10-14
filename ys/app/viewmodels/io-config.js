// io-config.js
(function(root, factory) {
	// var _modname = 'IO';
	if (typeof define === "function" && define.amd) { // AMD mode
		define(["underscore.all", 
			"shared/io.middleware", 
			"shared/config", 
			"viewmodels/storage-reflections",
			"shared/io.firebase" // <-- connect Firebase driver here!
			], factory);
	} else if (typeof exports === "object") { // CommonJS mode
		var _ = (typeof root._ === 'undefined') ? require("underscore.all") : root._;
		var IO = (typeof root.IO === 'undefined') ? require("shared/io.middleware") : root.IO;
		var config = (! root.MODULES || typeof root.MODULES.config === 'undefined') ? require("shared/config") : root.MODULES.config;
		var storage_reflections = (! root.MODULES || typeof root.MODULES.storage_reflections === 'undefined') ? require("viewmodels/storage-reflections") : root.MODULES.storage_reflections;
		root.IO = require("shared/io.firebase") //<-- it extends the global IO variable
		module.exports = factory(_, IO, config, storage_reflections);
	} else {
	// This module extends "IO" (which already exists as a global variable)
		factory(root._, root.IO, root.MODULES.config, root.MODULES.storage_reflections); // Plain JS, "rtl" is in window scope
		// root[_modname] = factory(root._, root.IO, root.firebase); // Plain JS, "rtl" is in window scope
	}
}(this, function(_, IO, config, mdReflections) {

	// Reflection -> Service -> Endpoint, Transport
	var Endpoint = IO.Endpoint;
	var Service = IO.Service;

	function Gateway(cfg) {
		var 
			_cfg = cfg || config,
			// data storage (db):
			_dataTsp = IO.Transport.factory(_cfg.storages.db, {}).init(_cfg.storages.config),
			// media storage:
			_blobTsp = IO.Transport.factory(_cfg.storages.media, {}).init(_cfg.storages.config),
			// multimedia transport dispatcher:
			_mmediaTsp = IO.MultiMediaDispatcher(_dataTsp, _blobTsp);

		//------------- DEV LOGIN
 		// _dataTsp.signIn({email:'d_z@mail.ru', password:'passwd'})
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

		var self = {};
		var newService = function (epAlias, tspAlias) {
			return Service(
				_.assertDefined(self.endpoints[epAlias], 'No endpoint for alias: '+epAlias), 
				_.assertDefined(self.transports[tspAlias], 'No transport for alias: '+tspAlias)
				)
		}
		/**
		 * Creates new instance of reflection, which wraps service related to the entityName
		 * @method newReflection
		 * @param  {[type]}      refName    Name of reflection (as in "storage-reflection")
		 * @param  {[type]}      entityName [description]
		 * @return {[type]}                 [description]
		 */
		var newReflection = function (refName, entityName) {
			var rfl = _.assertDefined(mdReflections[refName], 'Cannot find reflection for: '+entityName)
			var svc = _.assertDefined(self.services[entityName], 'Cannot find service for: '+entityName)
			return rfl.wrap(svc)
		}
		self.endpoints = {
				'Assets': Endpoint('assets'),
				'Timelines': Endpoint('timelines'),
				'Channels': Endpoint('channels'),
				'Playlists': Endpoint('playlists'),
				'Devices': Endpoint('devices'),
				'Users': Endpoint('users'),

				'Expositions': Endpoint('records')
			};
		self.transports = {
				// data storage
				'data' : _dataTsp,
				// media storage:
				'blob' : _blobTsp,
				// multimedia transport dispatcher:
				'mmedia' : _mmediaTsp
			};
		self.services = {
				'Assets': newService('Assets', 'mmedia'),
				'Timelines': newService('Timelines', 'data'),
				'Channels': newService('Channels', 'data'),
				'Playlists': newService('Playlists', 'data'),
				'Devices': newService('Devices', 'data'),
				'Users': newService('Users', 'data'),

				'Expositions': newService('Expositions', 'data')
			},
		self.reflections = {
				'Assets': newReflection('AssetReflection', 'Assets'),

				'Timelines': newReflection('TimelineReflection', 'Timelines'),
				'Playlists': newReflection('PlaylistReflection', 'Playlists'),

				'Channels': newReflection('ChannelReflection', 'Channels'),
				'Devices': newReflection('DeviceReflection', 'Devices'),
				'Users': newReflection('UserReflection', 'Users'),

				'Expositions': newReflection('ExpositionReflection', 'Expositions')
		};


			// _get: function (eName) {
			// 	return _.assertDefined(self._services[eName],
			// 		'Cannot find service for entity: '+eName)
			// }

		return self;

	};


	console.log('********************** GW')
	return _.extend(IO, {
		gw: Gateway()
	})

}));