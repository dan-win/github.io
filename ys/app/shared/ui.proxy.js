// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.ui_proxy = modfunc(
			_, $, ko
			);
	}
}

//ui.proxy.js
// Danwin
define ([
	'underscore.all',
	'jquery', 
	'knockout', 
	// ,'bootstrap'//, 
	// 'app/dialog-options'
	], 
	function (_, $, ko) {

	// components registration

	/*////////////////////////////////////////////////////////
	//
	// Dialog
	//
	*/////////////////////////////////////////////////////////


	var dlgSizes = {
		'small': 'modal-sm',
		'large': 'modal-lg'
	}

	var undefined;

	// register close handler for dialogs (reason: bootstrap styles interfere with submit/reset)
	// $(document).ready( function () {
	// 	$('body').delegate('.metaclass-dialog-close', 'click', function () {
	// 		$('*.metaclass-dialog').modal('hide'); // bootstrap plugin // to-do: avoid bootstrap.js, move to own meth
	// 	});
	// });

	var eachControl = function (domID, iterator, namespace) {
		// iterates over each control which name exits in namespace
		var 
			form = $('#'+domID+' form.metaclass-dialog-form');
			controls = form.find('input,select,textarea');
		controls.each(function (_, el) {
			var 
				el$ = $(el),
				id = el$.attr('data-field-name');
			if (_.isNull(namespace[id]) || !_.isUndefined(namespace[id])) {
				iterator(id, el$, namespace);
			} else {
				console.error('UI.Proxy error: value for ('+id+') is undefined for selected namespace.', namespace[id]);
				console.error(namespace);
				throw new Error (
					'Dialog error: data for field ('+id+') is undefined!');
			}
		});
	}

	var renderButton = function (data) {
		return _.renderStr(
			'<button type="{type}" class="btn {class}">'+
			'	{label}'+
			'</button>',
			{
				'type': data['type'] || 'button',
				'class': data['class'] || '',
				'label': _.assertDefined(data['label'])
			});
	}

	// store used "run dialog" buttons to avoid duplicates
	var usedButtons = {};

	// constructor
	var BasicDialogViewComponent = function (params) {

		this.IsVisible = ko._obs_(false);
		this.Ctx = _.assertDefined(params.data, 'Dialog context undefined!');
		_.assertTrue(this.Ctx && typeof this.Ctx == 'object',
			'Dialog context for "'+params.title+'" must be an object, but actual type is: ' + typeof this.Ctx);
		console.log('Ctx: ', this.Ctx);
		if (ko.isObservable(this.Ctx)) { 
			console.log('Ctx(): ', this.Ctx());
			this.Ctx = ko._fromObs_(this.Ctx);
		} // <--- to-do: check when Ctx is observable? 
		_.assertTrue(typeof this.Ctx.accept == 'function',
			'Dialog context for "'+params.title+'" must support "accept" method, actual type of "accept" field is: ' + typeof this.Ctx.accept);
		this.id = _.assertDefined(params.id, 
					'ID is required for dialog component!');
		if ($('#'+this.id).length > 0) throw new Error (
			'Dialog with ID ('+this.id+') already exists!');

		this.sizeCSS = (params.size && dlgSizes[params.size]) || 'modal-lg';
		this.title = params.title;
		this.body = params.body || '';
		this.buttons = params.buttons || [
			// {'label': 'Close', 'type': 'reset', 'class': 'btn-default' },
			{'label': 'Close', 'class': 'btn-default metaclass-dialog-close' },
			{'label': 'Ok', 'type': 'submit', 'class': 'btn-primary' }
		];

		// register listener~s
		var buttonId = _.assertDefined(params.on, 
			'Dialog definition error ("'+params.title+'"): "on" handler undefined.');
		if (buttonId in usedButtons) 
			throw new Error('Dialog error ("'+params.title+'") - button with Id '+buttonId+' already used!');
		if ($(buttonId).length == 0)
			throw new Error('Dialog error ("'+params.title+'") - button with Id '+buttonId+' does not exist!');
		usedButtons[buttonId] = true;

		var component = this;

		$(buttonId).click( function (event) {
			var el = this; // <--- Handler context, "this" assigned to DOM element!
			component.show(el, event);
		});

		this.onSubmit  = function () {
			component.Ctx.accept();
			_TRACE_('Accepted');
			component.close();
		}

		$('body').delegate('#'+component.id+' *.metaclass-dialog-close', 'click', function (event) {
			event.preventDefault();
			component.close();

			return false;
		});
	}

	BasicDialogViewComponent.prototype.show = function (el, event) {
		this.IsVisible(true);
		$('body').addClass('modal-open'); // bootstrap class, prevents scrolling
		$('<div class="modal-backdrop fade in"></div>').appendTo('body');
		$('*.modal.fade').addClass('in');
		$('#'+this.id).show();
	}

	BasicDialogViewComponent.prototype.close = function (argument) {
		$('body').removeClass('modal-open');
		$('*.modal.fade').removeClass('in');
		$('#'+this.id).hide();
		$('*.modal-backdrop').remove();
		this.IsVisible(false);
	}

	BasicDialogViewComponent.prototype.buttonset = function () {
		var 
			html = [];

		_.each(this.buttons, function (data) {
			html.push( renderButton(data) );
		});
		return html.join(' ');
	}

	ko.components.register('basic-dialog', {
        viewModel: BasicDialogViewComponent,
	    template: { require: 'text!templates/dialogs/basic-dialog.html' }
	});

	/*////////////////////////////////////////////////////////
	//
	// Collapsible titlebar
	//
	*/////////////////////////////////////////////////////////

	var Collapsible = function (params) {
		this.collapsed = ko._obs_(false);
		this.title = params.title;
		this.target = params.target;
	}

	Collapsible.prototype.click = function () {
		this.collapsed(!this.collapsed());
		$(this.target).toggle();
		// $(this).blur().children('span').toggle();
	}

	Collapsible.prototype.stateClass = function () {
		return (this.collapsed()) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';
	}

	ko.components.register('collapsible-titlebar', {
	    viewModel: Collapsible,
	    template: 
			'<span data-bind="html:title"></span>'+
			'<div style="float:right;position:relative">'+
			'	<a '+
			'		data-bind="attr:{href:target}, click:click" '+
//			'		data-toggle="collapse" '+
			'		role="button" >'+
			'		<span data-bind="css:stateClass()" class="glyphicon"></span>'+
			'	</a>'+
			'</div>' 
	});



// 	var InplaceEdit = function (params) {
// 		this.collapsed = ko._obs_(false);
// 		this.title = params.title;
// 		this.target = params.target;
// 	}

// 	InplaceEdit.prototype.click = function () {
// 		this.collapsed(!this.collapsed());
// 		$(this.target).toggle();
// 		// $(this).blur().children('span').toggle();
// 	}

// 	InplaceEdit.prototype.stateClass = function () {
// 		return (this.collapsed()) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';
// 	}

// 	ko.components.register('inplace-edit', {
// 	    viewModel: InplaceEdit,
// 	    template: 
// 			'<span data-bind="html:title"></span>'+
// 			'<div style="float:right;position:relative">'+
// 			'	<a '+
// 			'		data-bind="attr:{href:target}, click:click" '+
// //			'		data-toggle="collapse" '+
// 			'		role="button" >'+
// 			'		<span data-bind="css:stateClass()" class="glyphicon"></span>'+
// 			'	</a>'+
// 			'</div>' 
// 	});

	/*////////////////////////////////////////////////////////
	//
	// Callable dialog
	//
	*/////////////////////////////////////////////////////////

	// var templateDialog;
	// require(['text!templates/dialogs/dialog.html'], function(html){
	// 	templateDialog = html;
	// });

	// var Dialog = function (templateID, model, mapping) {
	// 	var
	// 		tmpl = templateDialog, // local copy of module var
	// 		el$ = $('#'+templateID),
	// 		dialog$ = (el$.length > 0) ? el$ : ('<div data-bind="template:{html:}">'+tmpl+'</div>').appendTo('body');
	// }
	// ----- last row
	return {
		showAlert: alert,
		showConfirm: null
	}
});