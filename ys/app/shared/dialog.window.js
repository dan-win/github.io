/**
 * Boostrap-based dialog (only Bootstrap's CSS used, w/o plugins), based on promises
 */


// Require jQuery:
if (typeof jQuery === 'undefined') {
  throw new Error('dialog.Windows\'s JavaScript requires jQuery')
}
// Require promises:
if (typeof Promise === 'undefined') {
  throw new Error('dialog.Windows\'s JavaScript requires Promise API or Promise polyfill')
}

+ function($) {
  'use strict';

  function DialogWindowFactory () {
  	var self = {
	  	instanceId: null,
	  	buffer: null,
	  	_resolve: null,
	  	_reject: null
  	};

  	self._showInterior = function () {
        // do aninate here?
		$(document.body)
			.addClass('modal-open')
			.append($(document.createElement('div'))
		        .addClass('modal-backdrop fade in'));

	  	// $(document.createElement('div'))
	   //      .addClass('modal-backdrop fade')
	   //      .appendTo($(document.body))

	    $('#'+self.instanceId)
	  		.on('click.dialog.window', '[data-dialog-control="Ok"]', 
	  			function (evt) {self.close(true); return false}
	  			)
	  		// Handle "Cancel"
	  		.on('click.dialog.window', '[data-dialog-control="Cancel"]', 
	  			function (evt) {self.close(false); return false})
	  		// Intercept click on button with Bootstrap's attribute data-dismiss="modal" (if any) 
	  		.on('click.dialog.window', '[data-dismiss="modal"]', 
	  			function (evt) {self.close(false); return false})
	    	.addClass('in')
	    	.show()
	    	.scrollTop(0);
  	}

  	self._hideInterior = function () {
  		// Hide dialog
  		$('#'+self.instanceId)
  			.removeClass('in')
  			.hide()
  			.off('click.dialog.window');

  		// Remove backdrop layers 
		$(document.body)
			.removeClass('modal-open')
			.children('.modal-backdrop')
			.remove() // <-- Remove backdrop layers,  Remove "dynamic" container with dialog if created from template
  	}

  	self._renderFromTemplate = function (templateId) {
  		var instanceId, $instance;

	  	if (typeof templateId === 'undefined')
	  		throw new Error('dialogWindow error: templateId is undefined!')
	  	try {
		  	var templateHtml = document.getElementById(templateId).innerHTML;
	  	} catch (e) {
	  		throw new Error('dialogWindow error: cannot find template element with id: '+templateId)
	  	}

	  	instanceId = 'instance-'+templateId;

	  	// Check whether instance already exists (error, because we rendeing from template)
  		if ($('#'+instanceId).length !== 0) {
  			// clear interior, remove container with previous instances:
			$(document.body)
				.children('.dynamic-modal-container')
				.remove() // <-- Remove backdrop layers,  Remove "dynamic" container with dialog if created from template
	  		console.warn('dialogWindow: previews instance cleared');
	  	}

		var $wrapper = $('<section/>')
			.addClass('dynamic-modal-container')
  			.appendTo($(document.body));

  		var $dialogBody = $(document.createElement('div'))
  			.addClass('modal-dialog')
  			.attr('role', 'document')

  		$(document.createElement('div'))
  			.addClass('modal fade')
  			.attr({
  				id: instanceId,
  				tabindex: -1,
  				role: 'dialog'
  			})
  			.append($dialogBody)
  			.appendTo($wrapper);

  		// console.log('$wrapper is: ', self.$wrapper);
  		$instance = $dialogBody
  			.html(templateHtml)
  			// .find('.modal')
  			// .attr('id', instanceId);	 

  		return instanceId; 	
  	}

  	self._pickData = function () {
  		var buffer = {}
  		var $root = $('#'+self.instanceId);
  		// to-do: type convert as-is in input buffer?
  		$.each(self.buffer, function (id, value) {
  			buffer[id] = $root.find('#'+id).val();
  		})
  		return buffer
  	}

  	self.fromTemplate = function (templateId) {
  		// dynamic dialog from template
	  	self.instanceId = self._renderFromTemplate(templateId)
	  	return self;
  	}

  	self.fromElement = function (id) {
  		// static from existing element
	  	self.instanceId = id;
	  	return self;
  	}

  	self.show = function (settings) {
  		var $root = null;
  		self.buffer = null;

	  	self._resolve = null;
	  	self._reject = null;

	  	// Initial data
	  	if (settings) {
	  		$root = $('#'+self.instanceId);
		  	if (typeof settings === 'function') {
		  		try {
			  		settings($root.get(0));
		  		} catch (e) {
		  			return Promise.reject(e)
		  		}
		  	} else if (typeof settings === 'object') {
		  		self.buffer = $.extend({}, settings);
		  		// Settings in form "domId": "value"
		  		$.each(settings, function (key, value) {
		  			// Allow substituion of elements interior, if any:
		  			$root.find('[data-dialog-value=\"'+key+'\"]').html(value)
		  			// Set values of controls, if any:
		  			$root.find('#'+key).val(value);
		  		})
		  	}
		}
	  	
	  	self._showInterior();

	  	return new Promise(function (resolve, reject) {
	  		self._resolve = resolve;
	  		self._reject = reject;
	  	});
  	}

  	/**
  	 * Hide dialog and clear related DOM
  	 * @method close
  	 * @return {[type]} [description]
  	 */
  	self.close = function (result) {
		// that.resetAdjustments()
		// that.resetScrollbar()
  		
  		// finalize dialog:
  		// Wait until Bootstrap hides dialog:
  		// $instance.on('hidden.bs.modal', function () {
  			// body...
  		if (result && self.buffer)
  			result = self._pickData();
  		self._resolve(result)
  		self._hideInterior();
  		// clear instance :
  		console.log('close called')

  		// Clear references
		self._resolve = null;
		self._reject = null;
  	}


  	return self;
  }

  // Export variable:
  window.dialogWindow = DialogWindowFactory();

}(jQuery);

// Endo of my code

