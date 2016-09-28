// custom-dialog.js
define(['plugins/dialog', 'durandal/app', 'knockout'], function (dialog, app, ko) {

	function assertDefined (value, name) {
		if (typeof value == 'undefined') 
			throw new Error('Requied argument "' +name+ '" is "undefined" in "customDialog" options!');
		return value;
	}

	function CustomDialog (options) {
		// body...
		var
			self = this,
			customStyle = (typeof options.cssClass == 'string') ? options.cssClass : null,
			sourceModel = assertDefined(options.buffer, 'buffer'),
			attrFilter = assertDefined(options.attrFilter, 'attrFilter'),

			changesInfo = {
				changed : {},
				subscriptions: []
			},
			// flag if at least one property was changed:
			wasChanged = false,
			// common listener to changes:

			// changesRouter = function (attrName) {
			// 	changesInfo.changed[attrName] = true;
			// 	wasChanged = true;
			// 	console.log('changed ', attrName);
			// },
			// fake model to detect only observable properties:
			referenceModel = attrFilter({}, sourceModel),
			// tmp vars:
			attr, listener, instance;

		// *** PRIVATE ***

		var copyChangedValues = function () {
			// copy only properties which are changed:
			for (var prop in changesInfo.changed) {
				sourceModel[prop](self[prop].peek());
				console.log('copying changed value: ', prop);
			}
		}

		// call on destruction:
		var disposeAll = function () {
			// clear subscriptions:
			while (changesInfo.subscriptions.length > 0) {
				changesInfo.subscriptions.pop().dispose();
			}
			if (customStyle) {
				$('.dialog-modal').removeClass(customStyle)
			}
		}

		// *** PUBLIC ***

		this.viewUrl = assertDefined(options.viewUrl, 'viewUrl');
		this.lookups = options.lookups || {};

		this.handleButton = function (caption) {
			dialog.close(self, caption);
			app.trigger('customDialog:'+caption, {'view': options.viewUrl, 'model': self});
		}
		this.Ok = function () {
			dialog.close(self, 'Ok');
			app.trigger('customDialog:Ok', {'view': options.viewUrl, 'model': self});
		}
		this.Cancel = function () {
			dialog.close(self, 'Cancel');
			app.trigger('customDialog:Cancel', {'view': options.viewUrl, 'model': self});
		}

		// *** main methods to dispatch dialog:
		this.waitConfirm = function (changedObservable) {
			var wrapper = function (result) {
				try {
					console.log('listeners after: ', ko.toJS(changesInfo));
					if (result === 'Ok' && wasChanged) {
						copyChangedValues();
						// mark changed flag or call "on confirm" handler function
						if (changedObservable) changedObservable(true);
					}
					disposeAll();
				} catch (e) {
					console.log('error: ', e);
				}
			}

			// method handles "Ok" press only 
			instance.then(wrapper);
		}

		this.then = function (handler) {
			// as "traditional" promise interface
			var wrapper = function (result) {
				handler(result);
				disposeAll();
			}
			instance.then(wrapper);
		}

		// intercept when dialog DOM is ready:
		
		this.compositionComplete = function () {
			// notification: "show"
			app.trigger('customDialog:show', {'view': options.viewUrl, 'model': self});
		}
		
		// *** initialization ***

		// Instantiate "filtered" fields and values in new instance:
		attrFilter(this, sourceModel);

		// Connect listeners:
		function newListener (attrName) {
			return function () { 
				changesInfo.changed[attrName] = true;
				wasChanged = true;
				console.log('changed ', attrName);
			};
		}

		for (var prop in referenceModel) {
			attr = referenceModel[prop];
			if (referenceModel.hasOwnProperty(prop) && ko.isObservable(attr)) {
				// listener = function () { changesRouter(prop); }
				// subscripe listener to the same own property, store reference:
				changesInfo.subscriptions.push(this[prop].subscribe(newListener(prop)));
				console.log('listening to: ', prop);
				console.log('current value: ', this[prop]());
			}
		}

		console.log('listeners: ', ko.toJS(changesInfo));

		// instantiate dialog window and show it:
		instance = app.showDialog(this);

		// customize css, including dimensions"
		if (customStyle) {
			$('.dialog-modal').addClass(customStyle)
		}

	}

	/**
	 * Executes a custom dialog to view/edit a ViewModel.
	 * Template based on html file (url passed in options).
	 * Use bindins for buttons inside template: data-bind="click:Ok", or "Cancel".
	 *
	 * Recommended usage: install this function into "app" namespace like plugin (usually in "main.js").
	 *
	 * @function customDialog
	 * @param {object} options
	 * @param {object} options.buffer View model to pass and to receive results.
	 * @param {object} attrFilter Implements a "factory" function to instantiate only a persistent subset of buffer properties (without computed props, notifications, etc.). Called with arguments: ({}, ViewModel).
	 * @param {string} options.baseUrl The base url to load the view ("html") from, for ex.: 'views/template1'
	 * @param {string} [options.lookups] Optional "coupled" models. Use weak references like ID.
	 * @param {string} [options.cssClass] Optional name of custom CSS class to customize dialog appearance. 
	 * Handling of user buttons - use a special handler in data-bind="click:handleButton('MyButton')"
	 */

	// var customDialog = function (options) {
	// 	// arguments: {buffer: ViewModel, attrFilter:StructModel, viewUrl:'', lookups:{}}
	// 	// a sample of StructModel see, e.g., in model-assets.js
	// 	var 
	// 		buffer = assertDefined(options.buffer, 'buffer'),
	// 		attrFilter = assertDefined(options.attrFilter, 'attrFilter'),
	// 		viewUrl = assertDefined(options.viewUrl, 'viewUrl'),
	// 		dialogModel = {},
	// 		changesInfo = {
	// 			listenerFuncs : [],
	// 			changed : {}
	// 		},
	// 		attr,
	// 		listener,
	// 		instance,
	// 		caption;

	// 	// Instantiate "filtered" fields and values in new instance:
	// 	dialogModel = attrFilter({}, buffer);

	// 	var changesRouter = function (attrName) {
	// 		dialogModel.changesInfo.changed[attrName] = true;
	// 	}

	// 	// Connect listeners:
	// 	for (var prop in dialogModel) {
	// 		attr = dialogModel[prop];
	// 		if (dialogModel.hasOwnProperty(prop) && ko.utils.isObservable(attr)) {
	// 			listener = function (argument) {
	// 				changesRouter(prop);
	// 			}
	// 			changesInfo.listenerFuncs.push(listener);
	// 			attr.subscribe(listener);
	// 		}
	// 	}

	// 	dialogModel.changesInfo = changesInfo;

	// 	dialogModel.handleButton = function (caption) {
	// 		dialog.close(dialogModel, caption);
	// 	}
		
	// 	dialogModel.viewUrl = viewUrl;
	// 	dialogModel.lookups = options.lookups || {};

	// 	dialogModel.Ok = function () {
	// 		dialog.close(dialogModel, 'Ok');
	// 	}
	// 	dialogModel.Cancel = function () {
	// 		dialog.close(dialogModel, 'Cancel');
	// 	}

	// 	instance = app.showDialog(dialogModel);

	// 	return {
	// 		waitConfirm : function (changedObservable) {
	// 			// method handles "Ok" press only 
	// 			var wrapper = function (result) {
	// 				if (result === 'Ok') {
	// 					buffer(attrFilter({}, dialogModel));
	// 					// mark changed flag or call "on confirm" handler function
	// 					if (changedObservable) changedObservable(true);
	// 				}
	// 			}
	// 			instance.then(wrapper);
	// 		},
	// 		then : function (handler) {
	// 			// as "traditional" promise interface
	// 			instance.then(handler);
	// 		}
	// 	}
	// };

	var customDialog = function (options) {

		return new CustomDialog(options);

	}

	return customDialog;
});