define(['plugins/router', 'durandal/app', 'knockout', 'jquery', 'tables/form1', 'shared/form.manage'], 
	function (router, app, ko, $, FormModel, formManager) {

		// Prepare data masks

		// -- data models - forms (end)

        var ctor = function () {

        var self = this;

        self.displayName = 'Guarantor Loan';
        self.description = '';
        self.features = [
        ];

        self.isComplete = ko.observable(true);

        self.fields = new FormModel();

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
            $('.required-field').each(function (index, el) {
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
                JQ_SEL_FIELD_FEEDBACK: 'section.user-message',
                JQ_SEL_REQUIRED: '.required-field',
                JQ_CLASS_MASKED: 'masked-field',
                JQ_CLASS_INCOMPLETE: 'incomplete-field'
            });

        }

        self.proceedPage = function () {
        	var hash;
        	checkCompleteAll();
        	if (self.isComplete()){
	        	if (self.activePageNo < 3) {
	        		// next page:
	        		hash = 'application-form/'+(self.activePageNo+1)
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
    
    // singleton!
    return new ctor();
});