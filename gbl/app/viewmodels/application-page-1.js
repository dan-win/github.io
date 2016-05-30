define(['plugins/router', 'durandal/app', 'knockout', 'jquery', 'shared/form.manage'], 
	function (router, app, ko, $, formManager) {

		// Prepare data masks

		// -- data models - forms (end)

        var ctor = function () {

        var self = this;

        self.displayName = 'Guarantor Loan';
        self.description = '';
        self.features = [
        ];

        self.isComplete = ko.observable(true);

        self.fields = {};

        // switch for template binding (used in html with "data-bind='compose:activePageView' directive"):
        self.activePageView = ko.observable();

        self.activePageNo = 1;

        // active class for tabbed notebook tabs (bootstrap):
        self.cssForTab = function (tabNo) {
        	return (tabNo == self.activePageNo) ? 'active' : '';
        };

        self.handleBindingError = function (error, bindingEl) {
        	system.error(error, bindingEl);
        }

        var _titles = {
        	"1": "Homepage",
        	"2": "App Page 2",
        	"3": "App Page 3"
        };

        self.activate = function (pageNo) {
        	pageNo = pageNo || 1;

        	var title = _titles[pageNo.toString()]

        	if (title) {
        		self.activePageNo = parseInt(pageNo);
	        	self.activePageView = 'application-page-' + pageNo;
	        	app.title = title

        	} else {
        		// redirect to error page
        	}
        }


        var checkCompleteAll = function () {
            var result = true, flag;
            $('*[required]').each(function (index, el) {
                var $el = $(el);
                flag = formManager.isFieldComplete($el);
                formManager.reflectFieldStatus($el, flag);
                result = result && flag;
            });
            self.isComplete(result);
        }

        self.compositionComplete = function () {

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



        }

        self.proceedPage = function () {
        	var hash;
        	checkCompleteAll();
        	if (self.isComplete()){
	        	if (self.activePageNo < 3) {
	        		// next page:
	        		hash = 'application-form-'+(self.activePageNo+1)
	        	} else {
	        		// last page:
	        		hash = 'thank-you'
	        	}
	        	// make post/promise here...
	        	router.navigate(hash,{
	        			replace: false, // replace history entry ?  
	        			trigger: true // trigger module activation ?
	        		});
        	}

        }

        // data model for the first part of application form
        
    };
    
    return ctor;
});