// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.model_display = modfunc(
			_, ko, 
			MODULES.model_base,
			MODULES.model_timeline,
			MODULES.templates_grids_all
			);
	}
}

//model-display.js

define([
	'underscore.all', 
	'knockout.all', 
	'viewmodels/model-base',
	'viewmodels/model-timeline', 
	'templates/grids/all'], 

	function(_, ko, BaseModel, libTimeline, GRID_STORAGE){

			// to-do: move templates to Composer
	var 
		Timeline = libTimeline.Timeline,
		StructTimeline = libTimeline.StructTimeline;

	/*////////////////////////////////////////////////////////
	//
	// Frame (elementary region on display for screen splitting).
	// Allows to restrict content placement
	// Holds reference to assigned Timeline (*-1)
	// Timeline instance is reusable for different
	// playlists, but frame instance is created for
	// one playlist only
	//
	*/////////////////////////////////////////////////////////

	var StructFrame = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		data = data || {};

		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'Frame', data);

		Field( 'Timeline', null, data, function (record) {
			return new Timeline(record);
		}); // !!!

		Field( 'DomID', 'frame_'+scope.StorageID(), data);
		Field( 'Style', 'position:absolute;top:0;left:0;width:100%;height:100%;', data);
		Field( 'CSS', '', data); // <- "class" attr

		return scope;
	}

	var Frame = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Frame_');

		StructFrame(self, data);

		//XXX var _data = self.Timeline.peek();
		//XXX self.Timeline(new Timeline(_data));

		// *** Constant fields ***

		self._rtti = 'class:Frame';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***

		self.Changed = ko._obs_(false).extend({
				rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
			});

		// *** Notifications chain ***
		function handleChanged () {
			self.Changed(true);
			// Notify parent:
			ko._notify_('ntf_FrameChanged').tell({sender: self});
		}

		function handleViewChanged () {
			ko._notify_('ntf_ViewChanged').tell({sender: self});
		}

		// <--- timeline is a complex object with a "Changed" property, subscribe to it:
		// Common props: 
		ko._observeChanges_(handleChanged, [
			'ntf_TimelineChanged',
			self.Label,
			self.DomID,
			self.Style,
			self.CSS
			], 'Frame - observe changes');

		// notify about visible changes, to not repeat Timeline notification
		ko._observeChanges_(handleViewChanged, [
			self.DomID,
			self.Style,
			self.CSS
			], 'Frame - observe view changes');

		// *** Methods ***

		self.render = function (objects, keyframes) { // to-do: render timeline via Grid, directly into it's HTML template!
			// wrap all slides of timeline into frame with placement and dimensions
			var 
				template = 
				'<!-- frame --><div id="{DomID}" class="{CSS} DDA" style="{Style}">{interior}</div>',
				// code = _.renderStr(template, self),
				children = [],
				interior;
			self.Timeline().render(children, keyframes); // frame has own content, but keyframes are common for playlist
			interior = _.renderStr(template, {
				'DomID':self.DomID(),'CSS':self.CSS(),'Style':self.Style(),'interior': children.join(' ')});
			objects.push(interior);
		}
	}

	/*////////////////////////////////////////////////////////
	//
	// Grid for the splitted screen interior
	// Contains frames (Frame)
	// Uses repository with a pure HTML templates
	//
	*/////////////////////////////////////////////////////////
	var GridTemplateInfo = function (storage, id) {
		var self = this;
		
		self._rtti = 'class:GridTemplateInfo';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		self.Label = storage[id]['label'];
		self.PresetID = _.assertDefined(id, 
			'Error in data for GridTemplateInfo: PresetID missed!');
		self.Media = storage[id]['media'] || [];
		self.filename = _.assertDefined(storage[id]['filename'], 
			'Error in grid gallery: filename missed for id "'+id+'" ');
	}

	var enumGridsGallery = function () {
		var en = [];
		for (var id in GRID_STORAGE) {
			// fix for Durandal's __moduleId__:
			if (id == '__moduleId__') continue;
			en.push( new GridTemplateInfo(GRID_STORAGE, id) );
		}
		return en;
	}


	// requires access to registry object (imported var)
	/*////////////////////////////////////////////////////////
	// Grid constructor
	*/////////////////////////////////////////////////////////

	var StructGrid = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'Default Layer', data);

		FieldA( 'Media', [], data); // <--- means "all media"

		FieldA('Frames', [new Frame()], data, function(record){
			return new Frame(record)
		});

		return scope;
	}

	var Grid = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Grid_');

		StructGrid(self, data);

		// convert js data to objects with methods:
		//XXX self.Frames(_.map(self.Frames.peek(), function (value) {
		//XXX 	return new Frame(value);
		//XXX }));

		// *** add common props/ methods for collection holder ***
		ko._bindCollectionPropsTo_(self, 'Frames');

		// *** Constant fields ***

		self._rtti = 'class:Grid';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***

		self.Changed = ko._obs_(false).extend({
				rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
			});

		self.selectedItem = ko._obs_(self.Frames.peek()[0]); // <--- redefine collection method with a default value!

		// *** Notifications chain ***
		function handleChanged () {
			self.Changed(true);
			ko._notify_('ntf_GridChanged').tell({sender: self});
		}

		ko._observeChanges_(handleChanged, [
			'ntf_FrameChanged',
			self.Frames, 
			self.Label, 
			self.Media
			], 'Grid - observe changes');

		// *** Computed fields (write only methods) ***

		self.HTML = function (html) {
				_parseGridInterior(html); // --> changes HTML(), do not generate own notification;
			};

		self.TemplateInfo = function (value) {
				self.loadFromPreset(value); // --> changes HTML(), do not generate own notification;
			};	

		// *** Methods ***

		self.render = function (objects, keyframes) {
			// wrap all frames into layer ("div" with absolute position, placement and dimensions)
			var 
				defaultGridTemplate = 
				'<div class="DDA" id="frameset_'+self.ReferenceID()+'" style="position:absolute;top:0;left:0;width:100%;height:100%;">{interior}</div>',
				children = [],
				interior,
				code;
			_.each(self.Frames.peek(), function (frame) {
				frame.render(children, keyframes);
			});
			interior = children.join(' ');
			code = _.renderStr(defaultGridTemplate, {'interior': interior});
			objects.push(code);
		}

		self.loadFromPreset = function (gridTemplateInfo) {
			var 
				filename = gridTemplateInfo && gridTemplateInfo.filename || null;
			if (!gridTemplateInfo) {
				return; // do not change html, it can contain custom changes;
			}
			require(['text!templates/grids/'+filename+'.html'], function (html){
				self.HTML(html);
			});
		}

		// private ---

		var _parseGridInterior = function (html) {
			var cells = [];
			var lastcell = null;
			// Find cells by class selector *.DDA
			// _TRACE_($(html).find('*.DDA').andSelf().filter('*.DDA'));
			var divs$ =  $(html)
							.find('*.DDA') // find children divs
							.andSelf() // add own level
							.filter('*.DDA'); // add divs from own level
			divs$.each(function(_, el){ // use jQuery each iterator
					lastcell = new Frame({
							Label: $(el).text(), // <--- get inner text
							DomID: el.id,
							CSS: el.getAttribute('class'),
							Style: el.getAttribute('style')
						}, 
						self.ReferenceID()
					);
					cells.push( lastcell );
				});

			// validate template:
			if (cells.length == 0) {
				console.log('html->', html);
				throw new Error(
						"Inalid grid template: (empty or no DDA placeholders) "+
						html);
			}

			// grid.selectedItem( lastcell ); // last frame selected by default
			_TRACE_('_parseGridInterior: Grid parsed and item selected: ===>', lastcell);

			// Update frame objects:
			self.Frames( cells );
		}

	} // Grid constructor

	// --- Playlist, playlist<-Grid(s)
	/*////////////////////////////////////////////////////////
	// Playlist: collection of Grid~s
	*/////////////////////////////////////////////////////////

	var StructPlaylist = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'New Playlist', data);

		Field( 'Comment', '', data);

		FieldA('Layers', [new Grid()], data, function (record) {
			return new Grid(record);
		});

		// Field('AspectRatio', '16by9', data);
		Field('AspectRatio', '4by3', data);

		return scope;
	}

	var Playlist = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Playlist_');

		StructPlaylist(self, data);

		// convert js data to objects with methods:
		//XXX self.Layers(_.map(self.Layers.peek(), function (value) {
		//XXX 	return new Grid(value)
		//XXX }));
		console.log('Playlist constructor: default layers: ', ko.toJS(self.Layers));


		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructPlaylist);

		// *** add common props/ methods for collection holder ***
		console.log('[1]', self.Layers);
		ko._bindCollectionPropsTo_(self, 'Layers');
		console.log('[2]', self.Layers);

		if (self.length() == 0) throw new Error("Playlist error: at least one layer neccessary!"); 

		console.log('Class Playlist.Layers===>>>', self.Layers);

		// *** Constant fields ***

		self._rtti = 'class:Playlist';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***

		self.Changed = ko._obs_(false).extend({
				rateLimit: { timeout: 500, method: "notifyWhenChangesStop" }
			});

		// *** Notifications chain ***
		function handleChanged () {
			self.Changed(true);
			ko._notify_('ntf_PlaylilstChanged').tell({sender: self});
		}

		ko._observeChanges_(handleChanged, [
			'ntf_FrameChanged',
			self.Label, 
			self.Comment, 
			self.Layers,
			self.AspectRatio,
			], 'Playlist - observe changes');

		ko._observeChanges_('ntf_ViewChanged', [
			self.AspectRatio,
			self.Layers,
			], 'Playlist - observe changes');

		// *** Methods ***

		self.render = function (scene, keyframes) {

//------------
			var code = ['<!-- playlist (layers) --><div id=\"playlist_'+self.ReferenceID()+'\">']; //['<!-- timeline --><div class="timeline" id="'+self.ReferenceID()+'">'], 
			var buffer = self.Layers.peek().slice(), inverted = buffer.reverse();
			_.each(inverted, function (layer, index) {
				var 
					child_objects = [],
					zindex = index,
					id = 'layer_'+layer.ReferenceID();

				layer.render(child_objects, keyframes); // <--- render both geometry and keyframes

				// --- geometry (center-block class from Bootstrap 3):
				code.push('<div style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:'
					+ zindex + ';background:transparent;" id="'+id+'">');
				code.push(child_objects.join('\n')); // insert geometry
				code.push('</div><!-- playlist (end) -->');

				// --- keyframes - left "as-is"
				// keyframes.push( keyframe_ );
			});

			// -- active part, animations
			code.push('</div><!-- playlist (end) -->');
			scene.push( code.join(' ') );

//------------
			
		}
		
	}

	// ratio name -> CSS class
	Playlist.SupportedAspectRatios = [
		{'Label':'4:3', 'CSS':'4by3'},
		{'Label':'16:9', 'CSS':'16by9'}
	];

	// --- last row (export symbols)
	return {
		Playlist: Playlist,
		StructPlaylist: StructPlaylist,
		Grid: Grid,
		StructGrid: StructGrid,
		Frame: Frame,
		StructFrame: StructFrame,

		GridTemplateInfo: GridTemplateInfo,
		enumGridsGallery: enumGridsGallery // to-do: move 'enumGridsGallery' to app modules (Composer)
	};
});