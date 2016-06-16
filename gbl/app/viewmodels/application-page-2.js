define(['plugins/router', 'durandal/app', 'knockout', 'jquery', 'viewmodels/app-form-factory'], 
function (router, app, ko, $, formFactory) {


	var ctor = function () {

		var self = formFactory(this); // <--- factory here self = viewModelFactory(this);

		self.activePageNo = 2;

		// default redirection after POST:
		self.redirectTo = '#application-page-3';

		app.title = 'Application Page 2';

		self.ENCODE_FLG_MESSAGE = 'encodeUpdateLeadGuarantorMessage';

		app.on('appform:activate').then(function () {
		});


		app.on('appform:uiReady').then(function () {

			// add service (hidden) fields for the app form:

			function hidden(name, value) {
				return $('<input/>')
					.attr({'name':name, 'type':'hidden'})
					.val(value);
			}

			if (self.appId)
				$(self.jqFormSel).prepend(hidden('app_id', self.appId));
			
		});

		self._beforePost = function (postData) {
			// allows to pre-process form data
			if (app.customCfg.site === 'gl') {
				if (postData['residential_status'].toLowerCase() !== 'homeowner') {
					console.log('not Homeowner!');
					postData.site = 16849;
					self.redirectTo = '#non-ho-gtr-thank-you';
				}
			}
			// for 'gml' site keep all "as-is"
		}

		// data model for the first part of application form
		
	};
	
	return ctor;
});