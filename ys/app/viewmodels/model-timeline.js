// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.model_timeline = modfunc(
			_, ko, 
			MODULES.model_base,
			MODULES.model_asset
			);
	}
}

//model-timeline.js

define([
	'underscore.all', 
	'knockout.all', 
	'viewmodels/model-base',
	'viewmodels/model-asset'], 
	function(_, ko, BaseModel, asset){

	// misc

	var obs_options = { 
		rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } 
	},
	TYPE_INT = {numeric:0},
	TYPE_FLOAT = {numeric:2};

	var StructAsset = asset.StructAsset,
		Asset = asset.Asset;

	/*////////////////////////////////////////////////////////
	//
	// Slide (elementary part of timeline).
	//
	*/////////////////////////////////////////////////////////

	var StructSlide = function(scope, data) {
		scope = scope || {};
		data = data || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable, [obs_options]),
			FieldInt = ko._FieldFactory_(scope, ko.observable, [TYPE_INT, obs_options]),
			FieldFloat = ko._FieldFactory_(scope, ko.observable, [TYPE_FLOAT, obs_options]),
			FieldA = ko._FieldFactory_(scope, ko.observableArray, [obs_options]);

		Field( 'Asset', null, data, function (record) {
			return new Asset(record);
		});

		console.log('Asset: ', ko.toJS(scope.Asset()));

		FieldFloat( 'XScale', 100, data);
		FieldFloat( 'YScale', 100, data);

		FieldInt( 'Duration', 5, data);

		Field( 'TransitionOnEnter', '', data);
		FieldInt( 'TnEnDuration', 0, data);

		Field( 'TransitionOnExit', '', data);
		FieldInt( 'TnExDuration', 0, data);

		Field( 'ClassAttr', 'rtl-frame', data);
		Field( 'InnerClassAttr', 'rtl-container', data);
		Field( 'Style', '', data);

		Field( 'Order', 0, data);

		return scope;
	}

	var Slide = function (data) {
		// Placeholder for Asset item in Timeline

		var self = this;
		
		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Slide_');

		StructSlide(self, data);
		console.log(ko.toJS(self));

		// Redefine data foreld to object field: Convert struct data to real object with methods:
		//XXX var assetInfo = self.Asset.peek(); // <-- use this way, because "data" can contain both plain and observable objects!
		//XXX self.Asset(new Asset(assetInfo));

		// *** Constant fields ***

		self._rtti = 'class:Slide';
		
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***

		// *** Computed fields ***

		self.HasTransitionOnEnter = ko.pureComputed(function () {
				// listenong to changes: TnExDuration
				return self.TnEnDuration() > 0;
			}, self);

		self.HasTransitionOnExit = ko.pureComputed(function () {
				// listenong to changes: TnExDuration
				return self.TnExDuration() > 0;
			}, self);

		// this field computed by notification

		self.TotalDuration = ko.pureComputed(function () {
				// listening to changes: Duration, TnExDuration
				return self.Duration() + self.TnEnDuration() + self.TnExDuration();
			}, self);

		self.GlyphSrc = ko.pureComputed(function(){
				return ['/media',self.Filename && self.Filename() || ''].join('/');
			}, self);

		// *** Notifications chain ***

		// <--- timeline is a complex object with a "Changed" property, subscribe to it: 
		// Common propertues:
		ko._observeChanges_('ntf_SlideChanged', [
			self.Asset,
			self.XScale, 
			self.YScale, 
			self.TotalDuration, 
			self.TransitionOnEnter,
			self.TransitionOnExit,
			self.ClassAttr,
			self.InnerClassAttr,
			self.Style,
			self.Order
			], 'Slide: property changed');

		// Duration only:
		ko._observeChanges_('ntf_SlideDurationChanged', [
			self.TotalDuration 
			// self.Duration, 
			// self.TnExDuration
			], 'Slide: duration changed')

		// New rendering required:
		ko._observeChanges_('ntf_ViewChanged', [
			self.Asset,
			self.XScale, 
			self.YScale, 
			self.TotalDuration, 
			self.TransitionOnEnter,
			self.TransitionOnExit,
			self.ClassAttr,
			self.InnerClassAttr,
			self.Style,
			self.Order
			], 'Slide: view changed');


		// *** Methods ***

		self.addTransitionOnEnter = function () {
			self.TransitionOnEnter('show');
			self.TnEnDuration(1);
		}

		self.removeTransitionOnEnter = function () {
			self.TnEnDuration(0);
		}

		self.addTransitionOnExit = function () {
			self.TransitionOnExit('hide');
			self.TnExDuration(1);
		}

		self.removeTransitionOnExit = function () {
			self.TnExDuration(0);
		}

		self.render = function (objects, keyframes) {
			var 
				t1 = self.HasTransitionOnEnter(),
				t2 = self.HasTransitionOnExit(),
				ascentMs, visibleMs, descentMs, duration;

			// --- geometry:
			// var template = '<!-- slide --><div class="{ClassAttr}" style="{Style}"><div class="{InnerClassAttr}">'+
			// 	snippets[gentype]+'</div></div>';
			objects.push('<!-- slide -->');
			self.Asset().render(objects, keyframes);
			objects.push('<!-- slide end -->');

			// --- keyframes
			// time: convert secods to milliseconds
			ascentMs = (t1) ? self.TnEnDuration() * 1000 : 0;
			visibleMs = self.Duration() * 1000;
			descentMs = (t2) ? self.TnExDuration() * 1000 : 0;

			keyframes.push({
				hiddenMs:0, 
				ascentMethod: (t1) ? self.TransitionOnEnter() : 'show', 
				ascentMs: ascentMs, 
				visibleMs: visibleMs, 
				descentMethod: (t2) ? self.TransitionOnExit() : 'hide',
				descentMs: descentMs,
				duration: ascentMs + visibleMs + descentMs
			});
		};

	}


	/*////////////////////////////////////////////////////////
	//
	// Timeline
	//
	*/////////////////////////////////////////////////////////
	var StructTimeline = function(scope, data) {
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

		FieldA('Items', [], data, function(record){
			return new Slide(record)
		});

		return scope;
	}

	var Timeline = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Timeline_');

		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructTimeline);

		StructTimeline(self, data);

		// convert js data to objects with methods:
		//XXX self.Items(_.map(self.Items.peek(), function (value, index, list) {
		//XXX 	return new Slide(value);
		//XXX }))

		// *** add common props/ methods for collection holder ***
		ko._bindCollectionPropsTo_(self, 'Items');

		// *** Constant fields ***

		self._rtti = 'class:Timeline';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***

		self.Changed = ko._obs_(false).extend(obs_options);

		self.DurationChanged = ko._obs_(false).extend(obs_options);

		// *** Computed fields ***

		self._duration = 0; // <-- cache results
		self.Duration = ko.pureComputed(function () {
			var 
				slides = self.Items.peek(), // 
				changed = self.DurationChanged(); // <-- listen to changes in existing slides
			if (changed) {
				self.DurationChanged(false);
				self._duration = 0;
				_.each(slides, function (slide) {
					self._duration += slide.TotalDuration();
				});
			}
			return self._duration;
		}, self);

		// *** Notifications chain ***

		function handleChanged () {
			self.Changed(true);
			ko._notify_('ntf_TimelineChanged').tell({sender: self})
		}

		function handleDurationChanged() {
			self.DurationChanged(true);
		}

		// function handleViewChanged () {
		// 	ko._notify_('ntf_ViewChanged').tell({sender: self});
		// }

		// Duration changes:
		ko._observeChanges_(handleDurationChanged, [
			'ntf_SlideDurationChanged',
			self.Items
			], 'Timeline: duration changed');

		// Common properties:
		ko._observeChanges_(handleChanged, [
			'ntf_SlideChanged',
			self.Label, 
			self.Items, 
			self.Duration // <- implicit handling of 'ntf_DurationChanged'
			], 'Timeline: property changed');

		// self.selectedItem.subscribe(function handleSelected () {
		// 	ko._notify_('Timeline.nf_SelectionChanged').tell({sender: self, subject: self.selectedItem});
		// });

		// "Numbering":
		ko.computed(function () {
			var items = self.Items(), 
				counter = 0, slide, transition;
			for (var i=0, len=items.length; i<len; i++){
				counter++;
				slide = items[i];
				slide.Order(counter);
				if (slide.HasTransitionOnExit()) counter++;
			}			
		});

		// to-do: see numbering error on add/insert:
		self._updateOrderFrom = function (start_ind){
			// to-do: for "batch" operations, perform them on simple array,
			// see: https://www.airpair.com/knockout/posts/top-10-mistakes-knockoutjs; "7. Do not repeatedly push ..."
			var counter = 0, slide;
			for (var i=start_ind, len=self.Items().length; i<len; i++){
				counter++;
				slide = self.Items()[i];
				slide.Order(counter);
				if (slide.HasTransitionOnExit()) counter++;
			}
		}

		self.render = function (objects, keyframes) {
			var 
				code = ['<!-- timeline -->'], //['<!-- timeline --><div class="timeline" id="'+self.ReferenceID()+'">'], 
				ilen = self.length(),
				hiddenMs = 0,
				timelineId = self.ReferenceID();

			// was: self.each(function...):
			_.each(self.Items.peek(), function (slide, index) {
				var 
					child_objects = [], child_keyframes = [], keyframe
					zindex = ilen-index,
					id = 'keyframe_'+timelineId+'_'+slide.ReferenceID();
				slide.render(child_objects, child_keyframes); // <--- render both geometry and keyframes

				console.log('Render - push slide: ', index, slide.Asset().Label())

				// --- geometry (center-block class from Bootstrap 3):
				code.push('<div style="position:absolute;left:0;top:0;width:100%;height:100%;display:none;z-index:'
					+ zindex + ';background:transparent;" id="'+id+'">');
				code.push(child_objects.join(' ')); // insert geometry
				code.push('</div>');
				// --- keyframes:
				keyframe_ = child_keyframes[0]; // unwrap 
				// correct start time
				keyframe_.hiddenMs = hiddenMs;
				hiddenMs += keyframe_.duration;

				keyframe_['DOMselector'] = '#'+id; // <--- using DOM element via #ID
				keyframes.push( keyframe_ );
			});
			// -- active part, animations
			// code.push('</div>');
			objects.push( code.join(' ') );
		}


		// to-do: use add/move/remove patterns from composer:transition:
		self.addSlide = function (data){
			var 
				index = self.Items().length,
				slide = new Slide(data);
			slide.Order(index+1);
			self.Items.push(slide);

			// ko._notify_('ntf_SlideDurationChanged').tell({sender:slide});
		}

		self.insertSlide = function (index, data) {
			var slide = new Slide(data);
			slide.Order(index+1);
			self.Items.splice(index, 0, slide);
			// self._updateOrderFrom(index-1);

			// ko._notify_('ntf_SlideDurationChanged').tell({sender:slide});
		}

		self.removeSlide = function (slide) {
			var index = self.Items.indexOf(slide);
			self.Items.remove(slide);
			// if (self.Items().length == 0) self.addSlide(); // keep 1 default slide
			// self._updateOrderFrom(index-1);

			// ko._notify_('ntf_SlideDurationChanged').tell({sender:null});
		}

		self.moveSlide = function (slide, index) {
			self.Items.remove(slide);
			self.Items.splice(index, 0, slide);
			slide.Order(index+1);
			// self._updateOrderFrom(index-1);
		}

		self.moveSlideByIndex = function (ifrom, ito) {
			var slide = self.Items()[ifrom];
			self.Items.splice(ifrom, 1);
			self.Items.splice(ito, 0, slide);
			slide.Order(ito+1);
			var imin = (ifrom < ito) ? ifrom : ito;
			self._updateOrderFrom(imin);
		}
					
		// transition~s stuff
		
		// self.addTransitionOnExit = function (slide) {
		// 	slide
		// 		.TnExDuration(1)
		// 		.TransitionOnExit("fadeOut"); // as default
		// 	self.Changed(true);
		// }

		// self.removeTransitionOnExit = function (slide) {
		// 	slide
		// 		.TnExDuration(0)
		// 		.TransitionOnExit(''); // as default
		// 	self.Changed(true);
		// }


	}


	// --- last row (export symbols)
	return {
		Slide: Slide,
		StructSlide: StructSlide,
		Timeline: Timeline,
		StructTimeline: StructTimeline
	};
});