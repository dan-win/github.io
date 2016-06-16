define(['plugins/router', 'durandal/app', 'knockout', 'jquery', 'viewmodels/app-form-factory'], 
function (router, app, ko, $, formFactory) {


	var ctor = function () {

		var self = formFactory(this); // <--- factory here self = viewModelFactory(this);

		self.activePageNo = 3;

		// default redirection after POST:
		self.redirectTo = '#thank-you';

		app.title = 'Application Page 3';

		self.ENCODE_FLG_MESSAGE = 'encodeUpdateLeadFinancesMessage';

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
		}
		
	};
	
	return ctor;
});