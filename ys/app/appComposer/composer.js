define([

	'jquery.all', // <-- including ntfbus
	'knockout.all', // <-- icnluding ko.mapping, sortable (with jquery-ui dependency, and a custom bindings)

	'shared/config',
	'shared/io.middleware',
	'plugins/router',

	'viewmodels/model-display',
	'viewmodels/model-composer', 
	'viewmodels/events'
	], 

	function ($, ko, config, IoMiddleware, router, mdDisplay, mdComposer) {
		'use strict';

		console.log('entering composer constructor...');

		var 
			undefined,
			composerClass = mdComposer.Composer;

		composerClass.prototype.activate = function (playlistId) {
			// function for Durandal loading process
			var 
				self = this,
				// playlistId = router.activeInstruction().params[0],
				_itemFound = undefined;

			console.log('>>> from .activate:', playlistId);

			var findPlaylist = function (list) {
				list = list || [];
				console.log('RETURNED DATA: ', list);
				$.each(list, function (index, item) {
					console.log('Searching playlist: ', playlistId, item.StorageID().toString());
					if (playlistId.toString() == item.StorageID().toString()) {
						_itemFound = item;
						return false;
					}
				});
				if (_itemFound) {
					console.log('Item found: ', _itemFound);
					self.Playlist().updateValues(_itemFound);
				} else {
					throw {"message": 'Cannot find playlist: ' + playlistId, code: 404}
				}
			};

			console.log('route:', playlistId);
			console.log('#playlistId', playlistId);

			self.loadPresets();

			if (playlistId) {
				// return promise:
				return new IoMiddleware().loadCollection('Playlists', findPlaylist, function (data) {
					return new mdDisplay.Playlist(data);
				});
			}
		}


		return composerClass;

		// var ctor = function () {
		// 	var self = this;


		// 	var io = new IoMiddleware();

		// 	console.log('router:');
		// 	// console.log(router);
		// 	// console.log(router.navigationModel());
		// 	// console.log(router.navigationModel()[0].hash);
		// 	console.log(router.activeInstruction());

		// 	var 
		// 		param = router.activeInstruction().params[0],
		// 		playlist = null;

  //           self._playlists = ko._obsA_([]);
  //           self.composer = new mdComposer.Composer();

	 //        self.activate = function () {
	 //            //the router's activator calls self function and waits for it to complete before proceeding
	 //            // if (self.items().length > 0) {
	 //            //     return;
	 //            // }

	 //            var 
	 //            	undefined, 
	 //            	_itemFound = undefined;

		// 		if (param) {
		// 			param = param.toString();
		//             io.loadCollection('Playlists', self._playlists, Playlist);
		//             $.each(function (index, item) {
		//             	if (item.StorageId().toString() == param) {
		//             		_itemFound = item;
		//             	}
		//             });
		//             self.composer.updateValues({'Playlist':_itemFound});
		// 		}



	 //            // return http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne', 
	 //            //     { tags: 'mount ranier', tagmode: 'any', format: 'json' }, 'jsoncallback').then(function(response) {
	 //            //     self.items(response.items);
	 //            // });
	 //        };
		// }

		// return ctor;

		// -------------------



		// var composerClass = new mdComposer.Composer();

		// console.log('Composer instance: ', ko.toJS(composerClass));

		// if (config.DEVMODE) {

		// 	// setTimeout(function(){composer.populate(composerClass);}, 5000);

		// 	console.log('Composer >>> ', ko.mapping.toJS(composerClass));
		// 	window.ys_composer = composerClass; // dev only
		// 	window.ko = ko;
		// }

		// // Durandal doesn't require applyBindings:
		// // ko.applyBindings(composerClass, document.getElementById('koapp-composer'));
		// // ko.applyBindings(composerClass);
	
		// // composer.onLoad( callback );
		// return composerClass; 
	}
);