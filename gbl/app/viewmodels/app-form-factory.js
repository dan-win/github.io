/*

to-do: extract variables from URL:


https://www.guarantormyloan.co.uk/gl/index.php?
utm_source=Source
&utm_medium=Medium
&utm_term=Term&
utm_content=Reference&
utm_campaign=Name


*/
//viewModelFactory - common fields and methods for the Applications Form Pages
define(function (require) {
	var
		system = require('durandal/system'),
		router = require('plugins/router'),
		app = require('durandal/app'),
		ko = require('knockout'),
		$ = jQuery = require('jquery'),
		formManager = require('shared/form.manage'),
		FLG = require('shared/flg-messages');

	function assertDefined (value, message) {
		if (typeof value === 'undefined')
			throw new Error( message || 'Required value is undefined' );
		return value;
	}

	// Lock jQuery.ready up to "compositionComplete"
	jQuery.holdReady(true);

	// "submitting" flag - to distinguish exit on sumbit and exit on page close
	var 
		submitting = false;

	return function FormPageFactory (self) {

		self.jqFormSel = 'form#app-form';

		self.FLG = FLG; // store reference for "descendant" viewmodels
		self.ENCODE_FLG_MESSAGE = null; // <- redefine in descendant views!

		// Whether "interstitial" layer is visible:
		self.interstitial = ko.observable(false);

		self.interstitial.subscribe(function () {
			system.log(self.interstitial() ? 'I-SPLASN ON' : 'I-SPLASN OFF' );
		});

		self.displayName = 'Guarantor Loan';
		self.description = '';

		self.formChanged = ko.observable(0);
		self.isComplete = ko.observable(true);

		self.appId = null;
		self.postUrl = app.customCfg.flg.postUrl;

		self.activePageNo = NaN;

		// assign value in descendant views:
		self.redirectTo = undefined;

		// active class for tabbed notebook tabs (bootstrap):
		self.cssForTab = function (tabNo) {
			return (tabNo === self.activePageNo) ? 'active' : '';
		};

		self.handleBindingError = function (error, bindingEl) {
			system.error(error, bindingEl);
		}

		var checkCompleteAll = function () {
			var result = true;
			$('*[required]').each(function (index, el) {
				var 
					$el = $(el),
					flag = formManager.isFieldComplete($el);
				formManager.reflectFieldStatus($el, flag);
				result = result && flag;
			});
			self.isComplete(result);
		};

		// /////////////////////////////////////////////
		//
		// handler for "activate" status of composition
		//
		// /////////////////////////////////////////////

		self.activate = function (appId) {

			// notify about "activate" status:
			app.trigger('appform:activate');

			self.appId = appId;

			// return promise - wait upon ":uiReady", when jQuery DOM manipulations are completed
			// return system.defer(function(dfd) {
			// 	app.on('appform:uiReady').then(function () {
			// 		dfd.resolve();
			// 	});
			// }).promise();
		};

		self.canDeactivate = function () {

			// confirm leaving page if something changed:
			if (!submitting && self.formChanged() > 0) {
				return app.showMessage(
					'Are you sure you want to leave this page?', 
					'Confirm', 
					['Yes', 'No']);
			}
			return true;
		};

		// /////////////////////////////////////////////
		//
		// handler for "compositionComplete" status
		//
		// /////////////////////////////////////////////

		self.compositionComplete = function () {

			// check presence of the required form in the view' html:
			if ($(self.jqFormSel).length === 0){
				throw new Error(
					'Error in the view DOM: the mandatory "form#app-form" object not found!');
			}

			// Unlock jQuery.ready:
			jQuery.holdReady(false);


			// apply validation plugins after composition is complete
			// installs callbacks for focusout, blur events

			formManager.installHelpers({
				JQ_SEL_MASKED_FIELD: 'input[data-inputmask-alias]',
				JQ_SEL_FIELD_FEEDBACK: 'span.form-control-feedback',
				JQ_SEL_USER_MESSAGE: null, //'section.user-message',
				JQ_SEL_REQUIRED: '*[required]',
				// JQ_CLASS_MASKED: 'masked-field',
				JQ_CLASS_INCOMPLETE: 'incomplete-field'
			});

			app.trigger('appform:compositionComplete');
			app.trigger('appform:uiReady');
			app.trigger('splash:hide');

		};


		self._getFields = function () {
			// enum form fields into object 
			var 
				pairs = $(self.jqFormSel).serializeArray(), 
				fields = {};
			
			$.each(pairs, function (index, item) {
				fields[item.name] = item.value.toString();
			});

			return fields;
		};

		self._post = function () {

			var 
				data = FLG[self.ENCODE_FLG_MESSAGE](self.postData),
				url = assertDefined(self.postUrl, 'self.postUrl is undefined');

			/* test exit: */
			if (app.customCfg.testing.emulateAjax) {
				setTimeout(function () {
					var response = {id: '000000', code: 0};
					// emulate ".done" call:
					self.appId = response.id;
					system.log('AJAX emulated, url:', url,' post data: ', data);
					app.trigger('appform:posted', response);
				}, 5000);
				return;
			}

			$.ajax(url, {
				method: 'POST',
				crossDomain: true,
				contentType: 'text/xml',
				data: data,
				dataType: 'text' // <-- do not convert to xml, process separately further
			})
			.done(function (response) {
				var response = FLG.decodeResponseMessage(response || '');

				if (parseInt(response.code) === 0 ) {
					// ok
					// extract appId:
					self.appId = response.id;
					app.trigger('appform:posted', response);
				} else {
					// server respond but returns error:
					app.trigger('appform:postError', response);
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				app.trigger('appform:postError', [jqXHR, textStatus, errorThrown]);
			});
		};


		self._beforePost = function (postData) {
			// allows to pre-process form data, change redirectTo ...
		};

		self.proceedPage = function () {
			var hash;
			checkCompleteAll();
			if (self.isComplete()) {

				submitting = true;

				// Show interstitial page
				self.interstitial(true);

				self.postData = self._getFields();

				self._beforePost(self.postData);

				self._post();

			}
		};


		// Install special handler to intercept changes in HTML bindings:
		$('body').on('change', self.jqFormSel+' input,select,checkbox', function () {
			var oldVal = self.formChanged.peek();
			self.formChanged(++oldVal);
		});
		// Utility to get value of field from HTML binding:
		self.fieldValue = function (fieldName) {
			return $('#'+fieldName).val();
		}

		// on post success: run redirection logic ()
		app.on('appform:posted').then(function dispatchNextPage() {
			var redirectTo = assertDefined(self.redirectTo, 'Route error: self.redirectTo is undefined!');
			router.navigate( redirectTo + '/'+self.appId, {
					replace: false, // replace history entry ?  
					trigger: true // trigger module activation ?
				});

		});

		// on post error: 
		app.on('appform:postError').then(function handleError() {
			router.navigate( self.appId ? 'error-page/'+self.appId : 'error-page',{
					replace: false, // replace history entry ?  
					trigger: true // trigger module activation ?
				});
		});

		return self;

	}

	// return FormPageFactory;

	// }

});		
