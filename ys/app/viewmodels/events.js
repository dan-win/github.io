// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.events = modfunc(ko, $,  null);
	}
}

define(['knockout', 'jquery'], function(ko, $){
	// -- Init plugins
	$(function(){
		// Asset Tree View
		
		// var dragging = null, 
		// 	initialcursor,
		// 	savedcursor = initialcursor = $('body').css('cursor');
			
		// function changeCursor(){
		// 	$('body').addClass('drag-no-drop');
		// 	$('.asset-folder-item, li.draggable-asset-item, li.draggable-asset-item>span').addClass('drag');
		// 	$('.drop-zone').addClass('drag-drop');
		// }
				
		// function restoreInitialCursor(){
		// 	$('body').removeClass('drag-no-drop');
		// 	$('.asset-folder-item, li.draggable-asset-item, li.draggable-asset-item>span').removeClass('drag');
		// 	$('.drop-zone').removeClass('drag-drop');
		// }
		
		// $('body')
		// 	.on('mouseup', function(){ 
		// 			if (dragging) {
		// 				dragging = null;
		// 				restoreInitialCursor();
		// 			}
		// 		});
		
		
		// $('#asset-tree-view').delegate('li.draggable-asset-item', 'mousedown', function(event){
		// 	var self = this;
			
		// 	dragging = this;
		// 	//return false;
		// 	//~ $(self).draggable({
		// 		// handle: 'span.tree-node-label',
		// 		//~ revert: true,
		// 		//~ helper: 'clone',
		// 		// helper: function(){return $(self).children('li.draggable-asset-item span.glyphicon');},
		// 		// cursorAt: { left: 5, top: -5 },
		// 		//~ cursor: "auto",
		// 		//~ zIndex: 1000,
		// 		//~ stop: function() {
		// 			//~ $(this).draggable("destroy");
		// 		//~ }
		// 	//~ });		
		// })
		// .delegate('li.draggable-asset-item', 'mousemove', function(event){
		// 		if (dragging) {
		// 			changeCursor();
		// 			return false;
		// 		}
		// 	});
			
		// //Drop target
		// $('#timeline-pool').delegate('.drop-zone', 'mouseup', function(){
		// 	if (dragging){
		// 		self.handleDroppedAsset(this, dragging);
		// 		restoreInitialCursor();
		// 		//~ console.log(dragging);
		// 		dragging = null;
		// 		//~ return false;
		// 	}
		// });
		
		// self.handleDroppedAsset = function(target, item){
		// 	var assetData = ko.dataFor(item),
		// 		anchorSlide = ko.dataFor(target), 
		// 		context = ko.contextFor(target),
		// 		model = context.$root,
		// 		timeline = model.ActiveTimeline.peek();
			
		// 	if ($(target).hasClass('mc-beginning')){ 
		// 		timeline.insertSlide(assetData, 0);
		// 	} else {
		// 		timeline.insertSlide(assetData, ko.utils.unwrapObservable(anchorSlide.Order));
		// 	}
		// 	//~ console.log(ko.dataFor(target));
		// 	//~ console.log(ko.dataFor(item));
		// }
		
		// var destructor = function() {
		// 	$(this).droppable("destroy");
		// }
		
		//~ $('#timeline-pool').delegate('drop-zone', 'mouseenter', function(event){
			//~ console.log(this);
			//~ $(this).droppable({
				//~ accept: 'li.draggable-asset-item',
				//~ drop: function( event, ui ) {console.log(ui);}
			//~ });
		//~ });
		//~ .delegate();
		
		//~ $('#asset-tree-view li.draggable-asset-item').draggable({
			//~ handle: 'span.tree-node-label',
			//~ helper: 'clone'
			//~ //connectToSortable: '#timeline-pool'
		//~ });
		
		var preventSelect = function (event) {event.preventDefault();}
		$('#asset-tree-view *').on('selectstart mousedown', preventSelect);
		
		// Sortable
		// sortable settings
		var sortable_item_selector_suffix = " > div" ; // means all children "div" in subset
//---
		// $('#timeline-pool').sortable({
		// 	items: sortable_item_selector_suffix,
		// 	handle: ".gutter",
		// 	containment: "parent",
		// 	placeholder: 'ys-sortable-placeholder',
		// 	forcePlaceholderSize: true
		// 	/*,
		// 	axis: "y"*/
		// }) 		//attach event handlers
		// 	.on('sortupdate', function(event, ui){
		// 		var 
		// 			last_ord =1, // order, 1-based 
		// 			initial_ord=-1,  // order, 1-based
		// 			dest_ind=-1,  // index, zero-based
		// 			this_ord=-1;  // order, 1-based
		// 		$('#timeline-pool'+sortable_item_selector_suffix).each(function(index){
		// 			this_ord = $(this).attr('x-slide-handle');
		// 			if (last_ord > this_ord) {
		// 				initial_ord = this_ord;
		// 				dest_ind = index;
		// 				return false;
		// 			}			
		// 			last_ord = this_ord; // store for next iteration
		// 		});		
				
		// 		if (initial_ord > -1){
		// 			var model = ko.contextFor(this).$root,
		// 				timeline = model.ActiveTimeline.peek();
		// 			timeline.moveSlideByIndex(initial_ord-1, dest_ind);
		// 		}

		// 		// var item = ui.item, placeholder = ui.placeholder;


		// 		// console.log(ko.dataFor(this)); // 
		// 		// console.log(ko.contextFor(this)); //
		// 		// console.log(ui.helper);
		// 		// console.log(this); //<--<-- timeline-pool
		// 		// console.log(ko.dataFor(this).slide); // <--- i
		// 		// console.log(placeholder);
		// 		// console.log(placeholder.get(0));
		// 		// console.log(ko.contextFor(placeholder.get(0)));
		// 		// console.log(ko.contextFor(item.get(0)).$index()); // <--- i
		// 		// console.log(ko.contextFor(item.get(0)).slide); // <--- i
		// 		// console.log(ko.contextFor(placeholder.get(0)).$index());
		// 	});
//----
			$('#timeline-pool')
			.delegate(".metaclass-remove", "click", function() {
				//retrieve the context
				var context = ko.contextFor(this),
					model = context.$root,
					timeline = model.ActiveTimeline(), // <---- observable array inself
					slide_obj = context.$data;

			 	console.log('remove');

				//remove the data (context.$data) from the appropriate array on its parent (context.$parent)
				timeline.removeSlide(slide_obj);

			 	console.log('remove done');
			 
				return false;
			})
			.delegate(".metaclass-add", "click", function() {
				//retrieve the context
				var context = ko.contextFor(this),
					model = context.$root,
					timeline = model.ActiveTimeline();
			 
				//add a child to the appropriate parent, calling a method off of the main view model (context.$root)
				timeline.addSlide(null);
			 
				return false;
			})
			.delegate(".metaclass-insert-first", "click", function() {
				//retrieve the context
				var context = ko.contextFor(this),
					model = context.$root,
					timeline = model.ActiveTimeline(); // <---- observable array inself
				
				//add a child to the appropriate parent, calling a method off of the main view model (context.$root)
				timeline.insertSlide(0, null);
			 
				return false;
			})
			.delegate(".metaclass-insert", "click", function() {
				//retrieve the context
				var context = ko.contextFor(this),
					slide_obj = context.$data,
					model = context.$root,
					timeline = model.ActiveTimeline(), // <---- timeline
					index= timeline.Items.indexOf(slide_obj); // = context.$index();
				
				//add a child to the appropriate parent, calling a method off of the main view model (context.$root)
				timeline.insertSlide(index+1, null);
			 
				return false;
			})
			.delegate(".metaclass-add-transition", "click", function() {
				//retrieve the context
				var context = ko.contextFor(this),
					slide = context.$data,
					model = context.$root; // = context.$index();
				
				slide.addTransitionOnExit();			 

				return false;
			})
			.delegate(".metaclass-remove-transition", "click", function() {
				//retrieve the context
				var context = ko.contextFor(this),
					slide = context.$data,
					model = context.$root; // = context.$index();
				
				slide.removeTransitionOnExit();
			 
				return false;
			});

		// Grid preview pane

		// Selection function: Frame click
		$('.ctrl-display-grid-preview').delegate('.DDA', 'click', function (event) {
			var element = this,
				el$ = $(element),
				domID = el$.attr('id'),
				context = ko.contextFor(element),
				model = context.$root,
				frameObj = ko.dataFor(element);

				console.log('Selection: frameObj ', frameObj);

			// frameObj = model.ActiveLayer.peek().findFrame({'DomID': domID});
			if (!frameObj) 
				throw new Error('Click event: Frame by ID "'+domID+'"" not found! Binding context error?');
			model.ActiveFrame(frameObj);
			// deselect all:
			// $('.ctrl-display-grid-preview *.DDA').removeClass('active');
			// select clicked:
			// el$.addClass('active');
		});

	});
});