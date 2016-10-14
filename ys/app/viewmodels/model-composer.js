// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.model_composer = modfunc(
			_, ko, 
			MODULES.config,
			IO,
			// IO,
			MODULES.model_base,
			MODULES.model_asset,
			MODULES.model_timeline,
			MODULES.model_display,
			MODULES.model_exposition,
			rtl, // <----------- UMD, creates name in global scope
			MODULES.dialog_layout,
			MODULES.dialog_textbox,
			MODULES.htmltemplate
			);
	}
}

//model-composer.js

define([
		'underscore.all',
		'knockout.all',
		'shared/config',
 		'viewmodels/io-config',
 		// 'shared/io',
 		'viewmodels/model-base',
		'viewmodels/model-asset',
		'viewmodels/model-timeline',
		'viewmodels/model-display',
		'viewmodels/model-exposition',
		'shared/rtl',
		'appComposer/dialog-layout',
		'components/dialog-textbox',
		// 'viewmodels/dialogs-composer',

 		'shared/htmltemplate' // <-- used for timeline rendering.
 		// 'ntfbus', // <-- only to reflect dependency, it's aleady instantiated in "jquery-loader"
 		// 'dialog' // binding for html
 		// 'json2'
 		// ^ to-do: migrate to components.
 		], 
 		function(_, ko, config, 
 				IO, 
 				BaseModel, 
 				libAsset, 
 				libTimeline, 
 				libDisplay, 
 				libExposition,
 				Playback, 
 				DialogLayout, 
 				DialogTextBox){

	var 
		Playlist = libDisplay.Playlist,
		StructPlaylist = libDisplay.StructPlaylist,
		Grid = libDisplay.Grid,
		enumGridsGallery = libDisplay.enumGridsGallery,

		Timeline = libTimeline.timelineMapping,

		AssetCollection = libAsset.AssetCollection;

    // IO (!)

  function _loadCollection(entityName) {
  	// usage: _loadCollection('entityName').then(function(data){...})
	  var storageSvc = IO.gw.services[entityName];
	  var itemRef = IO.gw.reflections[entityName];
	  return storageSvc.signIn()
		  .then(function () {
		  	return itemRef.enum();
		  })
  }

  function _loadItem(entityName, objInsatance) {
  	// usage: _loadItem('entityName').then(function(data){...})
	  var storageSvc = IO.gw.services[entityName];
	  var itemRef = IO.gw.reflections[entityName];
	  return storageSvc.signIn()
		  .then(function () {
		  	return itemRef.load(objInsatance);
		  })
  }

  function _saveItem(entityName, objInsatance) {
  	// usage: _loadItem('entityName').then(function(data){...})
	  var storageSvc = IO.gw.services[entityName];
	  var itemRef = IO.gw.reflections[entityName];
	  return storageSvc.signIn()
		  .then(function () {
		  	return itemRef.save(objInsatance);
		  })
  }

	console.log('Playlist type:', typeof Playlist);
	console.log(libDisplay);

	// var io = IoMiddleware.Gateway(config);
	var playerObject = new Playback('#preview-display');

	/*////////////////////////////////////////////////////////
	//
	// Template loader
	//
	*/////////////////////////////////////////////////////////

	/*////////////////////////////////////////////////////////
	//
	// Composer
	//
	*/////////////////////////////////////////////////////////
	var
		ntf_settings = {rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }}; // to-do: apply extenders to restrict updates rate
	//.extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } });
	
	// Setup "draggable" behaviour for AssetTreeNode -> Timeline
	libAsset.AssetTreeNode.DraggableCloneFactory = function (data) {
		var asset = data; // <-- clone object or create new from raw JS
		console.log('Dropped: ', ko.toJS(asset));
		return new libTimeline.Slide({'Asset': asset});
	}

	var StructComposer = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		data = data || {};

		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		function playlistFactory(record) {
			return new Playlist(record);
		}

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'New Workspace', data);
		Field( 'Playlist', StructPlaylist, data, playlistFactory);

		console.log('--->Playlist, Layers: ', 
			ko.toJS(scope.Playlist), ko.toJS(scope.Playlist().Layers));

		Field( 'Comment', '', data);

		return scope;
	}

	// Snippets for different types of media (IDs in the parent HTML, at the bottom)
	var snippetsRegistry = {
		"transition-basic": "snippet-transition-basic-attrs"
		,"<undefined>":"snippet-image-attrs"
		,"Image":"snippet-image-attrs"
		,"Video": "snippet-movie-attrs"
		,"Text": "snippet-text-attrs"
		,"RSS": "snippet-feed-attrs"
		,"Twitter": "snippet-feed-attrs"
	}

	var Composer = function (data) { // <- here data is "saved workspace"
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Workspace_');

		StructComposer(self, data);

		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructComposer);

		// *** Misc ***

		var selection; // tmp variable;
		// self._selLayer = self.Playlist().Layers()[0];
		// self._selFrame = self._selLayer.Frames()[0];
		// self._selTimeline = self._selFrame.Timeline();

		// Convert Playlist data into Playlist object
		//XXX self.Playlist(new Playlist(self.Playlist.peek()));
		// *** Constant fields ***

		self._rtti = 'class:Composer';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***

		self.Changed = ko._obs_(false).extend({
				rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
			});

		// Environment / Workspace Initilizer
		// body...
		// Environment:
		// Load assets, enum grids, layouts
		// Actual asset objects for drag-n-drop palette
		// create dependencies with children

		console.log('enumGridsGallery: ', enumGridsGallery());

		self.AssetGallery = new AssetCollection(); // to-do: loading funcs

		self.GridGallery = ko._obsA_( enumGridsGallery() ); // actual set of grids in gallery  

		self.TimelinesGallery = ko._obsA_([]);

		// *** Session fields ***

		self.ActiveLayer = ko._obs_(self.Playlist().Layers.peek()[0]);
		self.ActiveFrame = ko._obs_(self.ActiveLayer().Frames.peek()[0]);
		self.ActiveTimeline = ko._obs_(self.ActiveFrame().Timeline.peek());

		self.ActiveLayer.subscribe(function () {
			var layer = self.ActiveLayer.peek();
			if (layer)
				self.ActiveFrame(layer.Frames.peek()[0]);
			else console.warn('layer undefined?', ko.toJS(self.Playlist().Layers()), 
				ko.toJS(self.ActiveLayer()));
		});

		self.ActiveFrame.subscribe(function () {
			var frame = self.ActiveFrame.peek();
			if (frame)
				self.ActiveTimeline(frame.Timeline.peek());
		});


		self.RenderMode = ko._obs_('all');
		self.EnumRenderModes = [
			{'label':'Timeline', 'value':'frame'},
			{'label':'Layer', 'value':'layer'},
			{'label':'All', 'value':'all'},
		];

		self.PlayerState = ko._obs_('');
		self.PlaybackIndicator = ko.pureComputed(function () {
			switch (self.PlayerState()) {
				case 'stPlayback': return 'glyphicon-play';
				case 'stPause': return 'glyphicon-pause';
				case 'stFfback': return 'glyphicon-fast-backward';
				case 'stFback': return 'glyphicon-backward';
				case 'stForward': return 'glyphicon-forward';
				case 'stFforward': return 'glyphicon-fast-forward';
				default: return '';
			}
		});

		// visual status of buttons in preview:
		self.pbCssRewind = ko.pureComputed(function () {
			var status = self.PlayerState();
			return (status === 'stStop') ? 'disabled' : ''
		})
		self.pbCssPlayback = ko.pureComputed(function () {
			var status = self.PlayerState();
			return (status === 'stPlayback') ? 'disabled' : ''
		})
		self.pbCssPause = ko.pureComputed(function () {
			var status = self.PlayerState();
			return (['stPlayback', 'stForward'].indexOf(status) > -1) ? '' : 'disabled'
		})
		self.pbCssStop = ko.pureComputed(function () {
			var status = self.PlayerState();
			return (['stPlayback', 'stPause', 'stForward'].indexOf(status) > -1) ? '' : 'disabled'
		})

		// *** Notifications chain ***
		self.PlayerState.subscribe(function (newValue) {
			console.log('Player state (composer):', self.PlayerState.peek())
		})
		
		// self.PlayerState.subscribe(function (newValue) {
		// 	switch (newV) {
		// 		case 'stPlayback': 
		// 			return 'glyphicon-play';
		// 			break;
		// 		case 'stPause': 
		// 			return 'glyphicon-pause';
		// 			break;
		// 		case 'stFfback': 
		// 			return 'glyphicon-fast-backward';
		// 			break;
		// 		case 'stFback': 
		// 			return 'glyphicon-backward';
		// 			break;
		// 		case 'stForward': 
		// 			return 'glyphicon-forward';
		// 			break;
		// 		case 'stFforward': 
		// 			return 'glyphicon-fast-forward';
		// 			break;
		// 		default: 
		// 			return '';
		// 	}
		// });

		function handleChanged () {
			self.Changed(true);
		}

		function handleViewChanged () {
			self.updatePreview();
		}

		// <--- playlist is a complex object with a "Changed" property, subscribe to it: 
		ko._observeChanges_(handleChanged, [
			'ntf_PlaylistChanged',
			self.Label, 
			self.Comment
			], 'Composer: observe changes');

		// changes listener
		ko._observeChanges_(handleViewChanged, [
			'ntf_ViewChanged',
			self.Playlist,
			self.RenderMode
			], 'Composer: view changed');

		// to-do: review this code:
		// If entire workspace reloaded from stream:
		self.Playlist.subscribe(function (playlist) {
			// var playlist = self.Playlist.peek();
			if (playlist) {
				self.ActiveLayer(playlist.Layers.peek()[0]); // select first layer
				document.title = 'yScreens Composer | '+playlist.Label.peek();
				// self.updatePreview();
			} else {console.warn('playlist is: ', playlist)}
		});


		// templates

		self.templates = {};

		self.templates.timeline_row = ko._obs_('');
		self.templates.item_interior = ko._obs_('');
		self.templates.transition_interior = ko._obs_('');

		self.snippets = {} // snippets by type
		self.loaded_snippets = {} // loaded snippets flags, by filename


		// METHODS:

		self.renderJSON = function (sourceObject) {
			// body...
			var 
				objects = [],
				keyframes = [],
				geometry, behavior, compiled;
			try {
				console.warn('sourceObject&&& ', ko.toJS(sourceObject));
				sourceObject.render(objects, keyframes);
			} catch (e) {
				console.error('renderJSON error:', e, 'sourceObject:', ko.toJS(sourceObject))
				throw e;
			}
			geometry = objects.join(' ');
			// behavior = ko.mapping.toJSON(keyframes);
			compiled = JSON.stringify({
				'scene': geometry,
				'motion': keyframes // unwrap array - it contain single item 
			});
			return compiled;
		};


		self.updatePreview = function () {
			// sourceObject - ActiveFrame or ActiveLayer or Playlist (any object which has "render" method)
			var 
				sourceObject, compiled;

			switch (self.RenderMode.peek()) {
				case 'frame':
					sourceObject = self.ActiveFrame.peek();
					break
				case 'layer':
					sourceObject = self.ActiveLayer.peek();
					break
				case 'all':
					sourceObject = self.Playlist.peek();
					break
				default:
					throw new Error('Unknown rendering mode: ', self.RenderMode.peek());
			}

			// clear display
			playerObject.stop();
			playerObject.clear();

			if (!sourceObject) {
				console.log('sourceObject is not defined, ignoring updatePreview...');   
				return;
			}

			try {
				compiled = self.renderJSON(sourceObject);
				playerObject.fromJSON(compiled);
			} catch (e) {
				console.log('Error updating preview: ', e, 'sourceObject', sourceObject);
			}
			console.log('preview updated');
			playerObject.rewind(0); //<-- make sure the first slide is visible
			self.PlayerState('stStop');
		};

		self.previewPlayback = function () {
			// sourceObject - ActiveFrame or ActiveLayer or Playlist
			if (playerObject.isPaused) {
				playerObject.resume()
			} else {
				playerObject.run()
			}
			self.PlayerState('stPlayback');

			console.log("Running...");
		};

		self.previewStop = function () {
			// sourceObject - ActiveFrame or ActiveLayer or Playlist
			playerObject.stop();
			// playerObject.rewind(0);
			self.PlayerState('stStop');

			console.log("Stopped...");
		};

		self.previewPause = function () {
			// sourceObject - ActiveFrame or ActiveLayer or Playlist
			playerObject.pause();
			self.PlayerState('stPause');

			console.log("Paused...");
		};


		// add/remove, ... all operations on layout

		self.newPlaylist = function () {
			// var layer = new Grid();
			// // Set fields to defaults except the new layer:
			// self.Playlist().updateValues({'Layers': [layer]});
			// self.ActiveLayer(layer);
			self.Playlist(new Playlist())
		};

		// server i/o
		// to-do: add "export" methods for layers, grid


		self.loadPlaylist = function (StorageID) {
			var playlist = new Playlist();
			playlist.StorageID(StorageID);
			return _loadItem('Playlists', playlist)
				.then(function (updatedPlaylist) {
					console.log('===>>>_loadItem', playlist, ko.toJS(playlist), updatedPlaylist, ko.toJS(updatedPlaylist));
					// self.Playlist(null);
					self.Playlist(updatedPlaylist);
					// self.updatePreview()
				})
				// to-do: handle exception
				.catch(function (reason) {
					console.error('Error on loading Playlist: ', reason);
				});
			// to-do: set active layer
			// ....
		};

		self.savePlaylist = function () {
			var playlist = self.Playlist.peek();
			return _saveItem('Playlists', playlist)
				.then(function () {
					document.title = 'yScreens Composer | '+playlist.Label.peek();
				})
			// to-do: handle exception
				.catch(function (reason) {
					console.error('Error on loading Playlist: ', reason);
				});
		};

		// Publish rendered movie
		self.publish = function () {
			var playlist = self.Playlist.peek();
			var js = self.renderJSON(playlist);
			
			var moviesSvc = IO.gw.services['Expositions'];
			var itemRef = IO.gw.reflections['Expositions'];

			var xp = new libExposition.Exposition()
			// Apply values:
			// Use same Id as for original playist:
			xp.StorageID(playlist.StorageID.peek())
			xp.json(js)
			xp.Label(playlist.Label.peek())
			xp.js(JSON.parse(js))
		  
		  moviesSvc.signIn()
			  .then(function () {
			  	return itemRef.save(xp);
			  })
			  .catch(function (reason) {
			  	console.error('Error on publishMovie:', reason);
			  })
		}

		// Layers

		self.addLayer = function () {
			var
				collection = self.Playlist().Layers,
				id =  collection().length,
				layer = new Grid({'Label':'Layer #'+id});
			collection.push(layer);
			self.ActiveLayer(layer);
			console.log('new layer: ', layer);
		};

		self.removeLayer = function () {
			var 
				collection = self.Playlist().Layers,
				layer = self.ActiveLayer(),
				newLayer,
				len = collection().length,
				index = collection.indexOf(layer);

			if (len === 1) return; // At least 1 layer neccessary

			index = (index === len-1) ? len-2: index+1;

			newLayer = collection()[index];
			self.ActiveLayer(newLayer);

			collection.remove(layer);

			handleViewChanged()
		};

		self.moveLayer = function (layer, index) {
			var 
				collection = self.Playlist().Layers,
				fromIndex = collection.indexOf(layer),
				buffer = collection.peek();

			buffer.splice(index, 0, buffer.splice(fromIndex, 1)[0]);
			collection(buffer);
			handleViewChanged()
		}

		self.moveLayerUp = function () {
			var 
				layer = self.ActiveLayer(),
				index = self.Playlist().Layers.indexOf(layer);

			if (index > 0) self.moveLayer(layer, index-1);
		}

		self.moveLayerDown = function () {
			var 
				layer = self.ActiveLayer(),
				collection = self.Playlist().Layers,
				len = collection().length,
				index = collection.indexOf(layer);

			
			if (index < len-1) self.moveLayer(layer, index+1);
		}

//--------------------------
		// self.addSlide = function (data){
		// 	var 
		// 		index = self.Items().length,
		// 		slide = new Slide(data);
		// 	slide.Order(index+1);
		// 	self.Items.push(slide);

		// 	ko._notify_('ntf_SlideDurationChanged').tell({sender:slide});
		// }

		// self.insertSlide = function (index, data) {
		// 	var slide = new Slide(data);
		// 	slide.Order(index+1);
		// 	self.Items.splice(index, 0, slide);
		// 	self._updateOrderFrom(index);

		// 	ko._notify_('ntf_SlideDurationChanged').tell({sender:slide});
		// }

		// self.removeSlide = function (slide) {
		// 	var index = self.Items.indexOf(slide);
		// 	self.Items.remove(slide);
		// 	// if (self.Items().length == 0) self.addSlide(); // keep 1 default slide
		// 	self._updateOrderFrom(index);

		// 	ko._notify_('ntf_SlideDurationChanged').tell({sender:null});
		// }

		// self.moveSlide = function (slide, index) {
		// 	self.Items.remove(slide);
		// 	self.Items.splice(index, 0, slide);
		// 	slide.Order(index+1);
		// 	self._updateOrderFrom(index);
		// }

//-------------------------

		// Timeline

		self.loadTimeline = function (StorageID) {
			return _loadItem('Timelines', self.ActiveTimeline.peek())
			// to-do: handle exception
				.catch(function (reason) {
					console.error('Error on loading Playlist: ', reason);
				});
		};

		self.saveTimeline = function () {
			return _saveItem('Timelines', self.ActiveTimeline.peek())
			// to-do: handle exception
				.catch(function (reason) {
					console.error('Error on loading Playlist: ', reason);
				});
		};

		self.loadAssetsGallery = function () {
			return _loadCollection('Assets').then(function (data) {
				self.AssetGallery.Items(data);
			})
			// to-do: handle exception
				.catch(function (reason) {
					console.error('Error on loading Playlist: ', reason);
				});
		};

		// templates
		self.selectAssetExtTemplate = function(itemtype){
			var typename = ko._fromObs_(itemtype); // self is observable;
			if (typename in snippetsRegistry){
				return snippetsRegistry[typename];
			}
			// console.log(typename); // to-do: remove all "console.log"
			throw "Template error: type "+typename.toString()+" have no associated templates!";
		};

		self.resetCounter = function () {
			self.counter = 0;
			return 0;
		};

		self.nextCounter = function () {
			self.counter++;
			return self.counter;
		};

		// Dialogs
		self.showLayoutDialog = function () {
			console.log('Starting dialog...');
			DialogLayout.show(self).then(function (response) {
				if(_.isNull(response)) return;
				ko._traverseTree_(self, ['ActiveLayer', 'TemplateInfo']) (response);
				console.log('selected template: ', response);
			});
		};

		self.showPlaylistNameDialog = function () {
			var options = {
				title: 'Change Playlist Name', 
				value: self.Playlist().Label()
			};

			console.log('Starting dialog...');
			DialogTextBox.show(options).then(function (response) {
				if(_.isNull(response)) return;
				self.Playlist().Label(response);
				console.log('New values : ', response);
			});
		};

		self.showFrameNameDialog = function () {
			var options = {
				title: 'Change Frame Name', 
				value: self.ActiveFrame().Label()
			};

			console.log('Starting dialog...');
			DialogTextBox.show(options).then(function (response) {
				if(_.isNull(response)) return;
				self.ActiveFrame().Label(response);
				console.log('New values: ', response);
			});
		};


		self.TransitionsList = libAsset.Asset.TransitionsList; // shortcut	

		self.ResourceTypes = libAsset.Asset.ResourceTypes; // shortcut	

		self.SupportedAspectRatios = libDisplay.Playlist.SupportedAspectRatios; // shortcut

		self.loadPresets = function () {
			// INITIALIZATION:

			// Template and snippet template loaders

			// function _loadTemplate (filename, target_observable){
			// 	require(['text!'+config.templatesRoot+'templates/composer/'+filename+'.html'], function(html){
			// 		target_observable(html);
			// 	});
			// };

			// function _loadSnippet (filename, typename){

			// 	if (!self.snippets[typename]) {
			// 		self.snippets[typename] = ko._obs_(''); // create empty observable for early binding
			// 	}

			// 	if (filename in self.loaded_snippets){
			// 		self.snippets[typename](ko._obs_(self.loaded_snippets[filename]));
			// 		return;
			// 	}
			// 	require(['text!'+config.templatesRoot+'templates/composer/'+filename+'.html'], function(html){
			// 		self.loaded_snippets[filename] = html;
			// 		self.snippets[typename](html);
			// 	});
			// };


			// // registerTemplates
			// // Templates must be registered / loaded in self method
			// // _loadTemplate('template-timeline-row', self.templates.timeline_row)
			// _loadTemplate('template-item-interior', self.templates.item_interior)
			// _loadTemplate('template-transition-interior', self.templates.transition_interior);
			
			// // Snippets
			// _loadSnippet('snippet-transition-basic-attrs', "transition-basic")
			// // _loadSnippet('snippet-transition-basic-attrs', "Wipe left")
		
			// _loadSnippet('snippet-image-attrs', "<undefined>")
			// _loadSnippet('snippet-image-attrs', "Image")
			// _loadSnippet('snippet-movie-attrs', "Video")
			// _loadSnippet('snippet-text-attrs', "Text")
			// _loadSnippet('snippet-feed-attrs', "RSS")
			// _loadSnippet('snippet-feed-attrs', "Twitter");			

			// enumerations from server
			// format: [{Label: ..., StorageID: ...}, ...]

			// Promise:
			var race = [self.loadAssetsGallery()];
			// Try to load playlist if StorageID specified in constructor "data"
			var _pData = data.Playlist ? ko._fromObs_(data.Playlist) : null,
					_id = _pData? ko._fromObs_(_pData.StorageID) : null;

			if (_id) {
				race.push(self.loadPlaylist(_id))
			}
			return Promise.all(race);
			// enum timelines:
			// io.loadCollection ('Timelines', self.TimelinesGallery, libTimeline.Timeline);


		}

		// INIT
		// self.loadPresets()
		// 	.catch(function (reason) {
		// 		console.error('error on loadPresets: ', reason);
		// 	});

	}

	// test data

	function populate (instance) {
		// assets
		var assets = [], slides = [],
			Asset = libAsset.Asset,
			Slide = libTimeline.Slide;

		for (var i=1; i<=7; i++){
			assets.push({	Label:'Bird '+i,	SrvFileName: 'bird'+i+'.jpg',	StorageID: 'A00'+i, // reference for actual object on server
				Type:'Image', XRes:1920, YRes:1080, Size: 0 }	);
		}
		assets.push({	Label:'Engine 2', FileName: 'engine1.jpeg', StorageID: 'A002', // reference for actual object on server
			Type:'Image', XRes:1920, YRes:1080, Size: 0 }	);
		assets.push({	Label:'Speaking Man', FileName: 'man.mp4', StorageID: 'A003', // reference for actual object on server
			Type:'Video', XRes:1920, YRes:1080, Size: 0 }	);
		assets.push({	Label:'Video 1', FileName: 'video1.jpeg', StorageID: 'A004', // reference for actual object on server
			Type:'Video', XRes:1920, YRes:1080, Size: 0 }	);

		assets.push({	Label:'N 1',	FileName: '1.jpeg',	StorageID: 'A010', // reference for actual object on server
			Type:'Image', XRes:1920, YRes:1080, Size: 0 }	);
		// assets.push({	Label:'N 2',	FileName: '2.jpeg',	StorageID: 'A010', // reference for actual object on server
		// 	Type:'Image', XRes:1920, YRes:1080, Size: 0, Src: '/api/media/2.jpeg' }	);
		// assets.push({	Label:'N 3',	FileName: '3.jpeg',	StorageID: 'A010', // reference for actual object on server
		// 	Type:'Image', XRes:1920, YRes:1080, Size: 0, Src: '/api/media/3.jpeg' }	);

		_.each(assets, function (data) {
			instance.AssetGallery.Items.push(new Asset(data));	
		});

		console.log('Gallery', ko.toJS(instance.AssetGallery.Items()));

		// slides
		slides.push(_.extend({XScale:1200,YScale:675,Duration:12,HasTransitionOnExit: true,
			TransitionOnExit:"Wipe left",TnExDuration:4,	}, assets[0]));
		slides.push(_.extend({XScale:1200,YScale:675,Duration:10,HasTransitionOnExit: false,
			TransitionOnExit:"",TnExDuration:0	}, assets[1]));
		slides.push(_.extend({XScale:1200,YScale:675,Duration:10,HasTransitionOnExit: true,
			TransitionOnExit:"Cross dissolve",TnExDuration:3 }, assets[2]));
		slides.push(_.extend({XScale:1200,YScale:675,Duration:10,HasTransitionOnExit: true,
			TransitionOnExit:"Cross dissolve",TnExDuration:3 }, assets[3]));
		slides.push(_.extend({XScale:1200,YScale:675,Duration:10,HasTransitionOnExit: true,
			TransitionOnExit:"Cross dissolve",TnExDuration:3 }, assets[4]));
		slides.push(_.extend({XScale:1200,YScale:675,Duration:10,HasTransitionOnExit: true,
			TransitionOnExit:"Cross dissolve",TnExDuration:3 }, assets[5]));
		slides.push(_.extend({XScale:1200,YScale:675,Duration:10,HasTransitionOnExit: true,
			TransitionOnExit:"Cross dissolve",TnExDuration:3 }, assets[6]));

		_.each(slides, function (data) {
			console.log(" ");
			console.log('Populating: instance.ActiveTimeline() --->', instance.ActiveTimeline.peek());
			instance.ActiveTimeline.peek().addSlide({'Asset': data});
		});
	}

	// --- last row (export symbols)
	return {
		Composer: Composer,
		populate: populate
	};
});


