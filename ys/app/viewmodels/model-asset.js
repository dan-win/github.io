// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.model_asset = modfunc(
			_, ko, 
			MODULES.model_base,
			MODULES.output_snippets,
			MODULES.config
			);
	}
}

//model-asset.js
define([
	'underscore.all', 
	'knockout.all', 
	'viewmodels/model-base',
	'templates/composer/output-snippets', 
	'shared/config'], 

	function(_, ko, BaseModel, snippets, config){


	var notype = '<undefined>';

	var 
		_glyphRoot = config.glyhpRoot || '/thumbnail',
		_mediaRoot = config.mediaRoot || '/data';

	var glyphRoot = function (value) {
		if (typeof value == 'undefined') return _glyphRoot;
		_glyphRoot = value;
	}

	var mediaRoot = function (value) {
		if (typeof value == 'undefined') return _mediaRoot;
		_mediaRoot = value;
	}

	var glyphByType = {
		'Image': 'glyphicon-picture', 
		'Video':'glyphicon-film', 
		'Text':'glyphicon-text-background', 
		'RSS':'glyphicon-cloud',
		'Twitter':'glyphicon-cloud'
	};

	var CSSByType =  {
		'Image': 'asset-picture', 
		'Video':'asset-film', 
		'Text':'asset-text-background', 
		'RSS':'asset-cloud',
		'Twitter':'asset-cloud'
	};


	/*////////////////////////////////////////////////////////
	//
	// Asset
	//
	*/////////////////////////////////////////////////////////

	var StructAsset = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'Noname', data);

		Field( 'MimeType', '', data);

		Field( 'MediaType', '', data);

		// Filename on remote client (unsafe name):
		Field( 'FileName', '', data);

		Field( 'SrvFileName', '', data);

		Field( 'Type', notype, data);
		Field( 'XRes', 0, data);
		Field( 'YRes', 0, data);
		Field( 'Size', 0, data);
		
		// Full path to file on a CDN server:
		// Field( 'Src', '/api/media/dummy.jpg', data);

		Field( 'FileSize', 0, data);

		Field( 'LockCount', 0, data);

		Field( 'Comment', '', data);

		return scope;
	}

	var Asset = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Asset_');

		StructAsset(self, data);
		
		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructAsset);

		// *** Constant fields ***

		self._rtti = 'class:Asset';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Computed fields ***
		self.Src  = ko.computed(function () {
			return (self.SrvFileName()!=='') 
				? [_mediaRoot, self.SrvFileName()].join('/')
				: '';
		});

		self.GlyphSrc = ko.computed(function(){
			return [_glyphRoot, self.SrvFileName()].join('/');
		}, self);

		// Auto-assign the media type by extension
		self.FileName.subscribe(function () {
			var 
				filename = self.FileName.peek(),
				ext = filename.split('.').pop(),
				mtype = Asset.mediaFileExt[ext];
			if (typeof mtype == 'undefined')
				throw new Error('Unsupported media type: '+ext);
			self.MimeType(Asset.MIMETypes[mtype]);
			self.MediaType(Asset.MediaTypes[mtype]);
			console.log('MEDIA: ',filename, ext, mtype, Asset.MIMETypes[mtype], Asset.MediaTypes[mtype]);

		});

		self.IconForMedia = ko.computed(function () {
			var _css = glyphByType[self.MediaType()];
			return '<i class=\"glyphicon '+_css+'\"></i>'
		});

		self.render = function (scene, keyframes) {
			var 
				aType = self.Type();

			// --- geometry only:
			// var template = '<!-- slide --><div class="{ClassAttr}" style="{Style}"><div class="{InnerClassAttr}">'+
			// 	snippets[aType]+'</div></div>';
			var template = '<!-- asset -->'+ _.assertDefined(snippets[aType],
				'Rendering error: Cannot find snippet for type: '+aType);
			var 
				code = _.renderStr(
						template,
						{
							"Src": self.Src(),
							"MimeType": self.MimeType(),
							"Label": self.Label()
						} 
					); // <-- select fields for rendering
			scene.push(code);
		}
		
		// no nested functions here - avoid "self" problem
	}


	Asset.ResourceTypes = ko._lookup_([
		notype,
		"Text",
		"Image",
		"Video",
		"RSS",
		"Twitter"
	]);

	Asset.TransitionsList = ko._lookup_([
		{Label: "Transparency", MethodName: "hide"},
		{Label: "Slide Down", MethodName: "slideDown"},
		{Label: "Slide Up", MethodName: "slideUp"},
		{Label: "Fade Out", MethodName: "fadeOut"}
	]);
	

	Asset.MediaTypes = {
		'MT_WEBM'	: 'Video',
		'MT_MP4'	: 'Video',
		'MT_OGG'	: 'Video',
		'MT_3GP'	: 'Video',
		'MT_GIF'	: 'Image',
		'MT_PNG'	: 'Image',
		'MT_JPEG'	: 'Image',
	}

	Asset.MIMETypes = {
		'MT_WEBM'	: 'video/webm',
		'MT_MP4'	: 'video/mp4',
		'MT_OGG'	: 'video/ogg',
		'MT_3GP'	: 'video/3gp',
		'MT_GIF'	: 'image/gif',
		'MT_PNG'	: 'image/png',
		'MT_JPEG'	: 'image/jpg',
	}

	Asset.mediaFileExt = {
		'webm'	: 'MT_WEBM',
		'mp4'	: 'MT_MP4',
		'ogg'	: 'MT_OGG',
		'ogv'	: 'MT_OGG',
		'3gp'	: 'MT_3GP',
		'gif'	: 'MT_GIF',
		'png'	: 'MT_PNG',
		'jpg'	: 'MT_JPEG',
		'jpeg'	: 'MT_JPEG',
	};


	// Note: assets loaded / stored as plain Collection
	// AssetTreeView is for "file browser" representation



	/*////////////////////////////////////////////////////////
	//
	// AssetCollection
	//
	*/////////////////////////////////////////////////////////

	var AssetCollection = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'AssetCollection_');

		data = data || [];

		self._rtti = 'class:AssetCollection';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		var _buffer = _.each(data, function (item) {
				_buffer.push(new Asset(item))
			});

		self.Items = ko._obsA_(_buffer);
		// Id in remote database (null for a new object):
		self.StorageID = ko._obs_(data.StorageID || null);

		self.selectedItem = ko._obs_(null);

		// *** add common props/ methods for collection holder ***
		ko._bindCollectionPropsTo_(self, 'Items');		

		self.asTreeView = function () { // to-do: computed observable, only on change of assets
			// Here "Type" used as criteria
			var _bytype = {}, type;
			_.each(self.Items(), function (asset) {
				type = ko._fromObs_(asset.Type);
				if (!_bytype[type]) _bytype[type] = [];
				_bytype[type].push(  asset );
			});
			var children = [], CID = ko._fromObs_(self.ReferenceID);
			for (var type in _bytype) {
				children.push({
					'Label': type, 
					'Children':_bytype[type]
				});
			}
			return new AssetTreeNode(
				{ // to-do: check memory leaks?
					'Label': 'Assets', 
					'Children': children
				}, 
				self);
		}
	}

	/*////////////////////////////////////////////////////////
	//
	// AssetTreeNode - representation for query "group by"
	//
	*/////////////////////////////////////////////////////////

	var AssetTreeNode = function (data, parent) {
		var self = this;
		self._rtti = 'class:AssetTreeNode';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		self.parent = _.assertDefined(parent);
		self.asset = null;		

		StructAsset(this, data);

		self.IsSelected = ko._obs_(false);

		self.Expanded = ko._obs_(!!data.Children);

		// Note: self object holds exact Asset attributes
		// during creation in AssetTreeView and mapping
		// of Asset Item, so attributes of Asset accessible
		// as own attributes.
		// Exception - root object and folders (intermediate nodes) 
		//  .Type() is used below directly as for Asset instance

		if (data.Children) { 
			// is Folder item
			self.asset = data;
			self.Children = ko._obsA_(_.each(data.Children, function (item, index, list) {
				list[index] = new AssetTreeNode(item, parent);
			}));
		}

		// helper, not field:
		self.Collapsed = function () {
			return (!self.Expanded() && self.Children);
		}

		self.GlyphClass = function () {
			if (self.IsFolder())
				return  (self.Expanded()) ? 'glyphicon-folder-open' : 'glyphicon-folder-close';
			return  glyphByType[self.Type()] || 'glyphicon-file'; // default icon
		}

		self.IsFolder = function(){
			return !!self.Children;
		}

		self.IsFile = function(){
			return !self.Children;
		}
		 
		self.toggle = function () {
			self.Expanded(!self.Expanded() && self.Children);
		}

		self.select = function () {
			// Proxy method, to call parent .select()
			var lastSelection = self.parent.selectedItem();
			if (lastSelection === self) return;
			if (lastSelection) lastSelection.IsSelected(false);
			self.IsSelected(true);
			self.parent.select(self);
		}

		// Wrapper for "knockout.draggable" plugin
		self.clone = function () {
			var clone = AssetTreeNode.DraggableCloneFactory(self);
			console.log('clone: ', ko.toJS(clone));
			return clone; // convert tree node to slide; ko.mapping inside
		}

		// // Wrapper for "knockout.draggable" plugin
		// self.dragged = function (item, event, ui) {
		// 	//retrieve the context
		// 	var context = ko.contextFor(ui),
		// 		model = context.$root,
		// 		timeline = model.ActiveTimeline(), // <---- observable array inself
		// 	var clone = new AssetTreeNode.DraggableCloneFactory(self);
		// 	_TRACE_('clone: ', ko.toJS(clone), ' parent _rtti: ', timeline._rtti);
		// 	return clone; // convert tree node to slide; ko.mapping inside
		// }

	}

	// Setup to Slide constructor (further) for "draggable" operations:
	AssetTreeNode.DraggableCloneFactory = null;


	// --- last row (export symbols)
	return {
		glyphRoot: glyphRoot,
		mediaRoot: mediaRoot,

		Asset: Asset,
		StructAsset: StructAsset,

		AssetCollection: AssetCollection,
		AssetTreeNode: AssetTreeNode
	};
});