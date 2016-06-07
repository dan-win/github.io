define(['plugins/router', 'durandal/app', 'knockout', 'jquery', 'viewmodels/app-form-factory'], 
	function (router, app, ko, $, formFactory) {


		var ctor = function () {

		var self = formFactory(this); // <--- factory here self = viewModelFactory(this);

		self.displayName = 'Guarantor Loan';
		self.description = '';

		self.activePageNo = 1;

		// default redirection after POST:
		self.redirectTo = 'application-page-2';

		app.title = 'Apply Now';

		self.ENCODE_FLG_MESSAGE = 'encodeCreateLeadMessage';

		app.on('appform:activate').then(function () {
			/* inject PCA script for postcode validation (only once)
			Note: this is modified snippet from PCA,
			allows to use accountCode from configuration 
			*/
			if (!window.pca) {
				var accCode = app.customCfg.pcaCode;
				// ------- begin of PCA snippet: -------
				(function (a, c, b, e) { 
					a[b] = a[b] || {}; 
					a[b].initial = { 
						accountCode: accCode, 
						host: accCode+".pcapredict.com" 
					}; 
					a[b].on = a[b].on || function () { 
						(a[b].onq = a[b].onq || []).push(arguments) 
					}; 
					var d = c.createElement("script"); 
					d.async = !0; 
					d.src = e; 
					c = c.getElementsByTagName("script")[0]; 
					c.parentNode.insertBefore(d, c) 
				})(window, document, "pca", "//"+accCode+".pcapredict.com/js/sensor.js");
				// ------- ^ end of PCA snippet --------
			}

		});


		app.on('appform:uiReady').then(function () {
			// Install Loan Calculator:
			$('body').on('updateLoanSummary', function loanCalculator () {
				var fixed_apr, repaying_per_month, total_amount_repayable;
				try {
					var 
						princ = parseInt($('#loan_amount').val(), 10),
						term = parseInt($('#loan_term').val(), 10),
						theint = 25.77,
						intr = theint / 1200,
						z = princ * intr / (1 - (Math.pow(1 / (1 + intr), term))),
						w = ((Math.round(z * 100) / 100) * (term));

					fixed_apr = '29.0';
					repaying_per_month = parseFloat(Math.round(z * 100) / 100).toFixed(2);
					total_amount_repayable = parseFloat(Math.round(w * 100) / 100).toFixed(2);

				} catch (e) {

					console.log('loanCalculator error', e);

					fixed_apr = '29.0';
					repaying_per_month = '...';
					total_amount_repayable = '...';

				};            	

				$('#fixed_apr').text(fixed_apr);
				$('#repaying_per_month').text(repaying_per_month);
				$('#total_amount_repayable').text(total_amount_repayable);

			}).triggerHandler('updateLoanSummary');

			// ^ fire event for initial values:

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
			if (app.customCfg.site == 'gl') {
				if (postData['residential_status'].toLowerCase() !== 'homeowner') {
					postData.site = 16849;
					self.redirectTo = 'non-ho-thank-you';
				}
			}
			// for 'gml' site keep all "as-is"
		}

		// data model for the first part of application form
		
	};
	
	return ctor;
});