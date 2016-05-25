define(['plugins/router', 'durandal/app', 'knockout', 'underscore', 'jquery', 'jquery.inputmask'], 
	function (router, app, ko, _, $, mask) {

		// -- data models - forms

		function FormModel() {
			var self = this, undefined;
			// body...
			/*
			???
			Repaying (Per Month) £<Monthly Payment>
			Total Amount Repayable £<Total Amount Repayable>
			Fixed Representative APR <Rep APR>%
			*/
			function _field(name, args) {
				self[name] = ko.observable(args["defVal"])
			}
			function _list(name, value) {
				self[name] = ko.observableArray(value);
			}
			function _computed(name, code) {
				self[name] = ko.pureComputed(code);
			}
			function _method(name, code) {
				self[name] = code;
			}
			function _fmtCurrency(v, sep) {
				sep = sep || ',';
				var result = [], cnt = 0, text = v.toString();
				for (var i = text.length - 1; i >= 0; i--) {
					result.push(text.charAt(i));
					if (++cnt === 3){
						cnt=0;
						result.push(sep);
					}
				}
				result.reverse();
				return result.join('');
			}

			// Your Loan Summary

			_field("RepayingPerMonth",
					{"mapTo":"", "appPage":1,"defVal":'???', "pattern":null});

			_field("TotalAmountRepayable",
					{"mapTo":"", "appPage":1,"defVal":'???', "pattern":null});

			_field("FixedAPR",
					{"mapTo":"", "appPage":1,"defVal":'???', "pattern":null});


			_field("LoanAmount",
					{"mapTo":"", "appPage":1,"defVal":3000, "pattern":null});

			_list("lkpLoanAmount",
					_.map(_.range(1000, 5000+1, 250), function (v) {
						return {"label":_fmtCurrency(v), "value":v}
					}));

			_computed("fmtLoanAmount",
					function () {
						return _fmtCurrency(self["LoanAmount"]());
					});

			_field("LoanTerm",
					{"mapTo":"", "appPage":1,"defVal":36, "pattern":null});

			_list("lkpLoanTerm",
					_.map(_.range(12,60+1, 6), function (v) {
						return {"label": v+' months', "value":v}
					}));

			// _computed("fmtLoanTerm",
			// 		function () {
			// 			return self["LoanTerm"]()+'&nbsp;month(s)';
			// 		});

			_field("LoanPurpose",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_list("lkpLoanPurpose",
					["Car Purchase", "Debt Consolidation", "Holiday", "Home Improvements", "Other"]);

			//About You

			_field("Title",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpTitle",
					["Miss", "Mr", "Mrs", "Ms", "Other"]);

			_field("FirstName",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("SurName",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("BirthDate",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpBirthDate",
					_.range(1, 31, 1));
			_field("BirthMonth",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpBirthMonth",
					_.range(1, 12, 1));
			_field("BirthYear",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpBirthYear",
					_.range(1938, 2000, 1));

			_field("MobilePhone",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("HomePhone",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("Email",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("EmploymentStatus",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpEmploymentStatus",
					["Employed", "Self Employed", "Unemployed", "Retired", "Student", "Benefits"]);

			_field("PayFrequency",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpPayFrequency",
					["Weekly", "Bi-Weekly", "Four Weekly", "Last Working Day of Month", "Specific Date", "Other"]);

			// Current Address

			_field("Postcode",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("AddressLine1",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("AddressLine2",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("CityTown",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("ResidentialStatus",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpResidentialStatus",
					["Homeowner", "Private Tenant", "Council Tenant", "Living with Family", "Other"]);

			_field("TimeAtAddress",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});


			_list("lkpTimeAtAddress",
					["More than 3 years", "Less than 3 years"]);

			_computed("isPreviousAddressRequired",
					function () {
						var val = self.TimeAtAddress() || '';
						return val.startsWith('Less');
					});

			_field("PreviousHouse",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("PreviousPostcode",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			//Your Bank Details

			_field("BankSortCode",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("BankAccountNumber",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});


			_field("AllowEmail",
					{"mapTo":"", "appPage":1,"defVal":true, "pattern":null});
			_field("AllowCall",
					{"mapTo":"", "appPage":1,"defVal":false, "pattern":null});
			_field("AllowPost",
					{"mapTo":"", "appPage":1,"defVal":false, "pattern":null});


			// Part II (About Your Guarantor)

			_field("GrntTitle",
					{"mapTo":"", "appPage":2});
			_field("GrntFirstName",
					{"mapTo":"", "appPage":2});
			_field("GrntSurName",
					{"mapTo":"", "appPage":2});
			_field("GrntMobilePhone",
					{"mapTo":"", "appPage":2, "pattern":null});
			_field("GrntHomePhone",
					{"mapTo":"", "appPage":2, "pattern":null});
			_field("GrntEmail",
					{"mapTo":"", "appPage":2, "pattern":null});
			_field("GrntResidentialStatus",
					{"mapTo":"", "appPage":2});


			// Part III (About Your Finances)
    		_field("NetMonthlyIncome",
					{"mapTo":"", "appPage":3});
    		_field("TotalHouseholdIncome",
					{"mapTo":"", "appPage":3});
    		_field("MortgageRentPayment",
					{"mapTo":"", "appPage":3});
    		_field("MonthlyLoanCommitments",
					{"mapTo":"", "appPage":3});
    		_field("Food",
					{"mapTo":"", "appPage":3});
    		_field("Utilities",
					{"mapTo":"", "appPage":3});
    		_field("Transport",
					{"mapTo":"", "appPage":3});
    		_field("OtherOutgoings",
					{"mapTo":"", "appPage":3});

			

		}


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
        	console.error(error, bindingEl);
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


        var testComplete = function ($el) {
        	// body...
    		var complete = $el.val();
    		if ($el.hasClass('masked-field'))
    			complete = $el.inputmask('isComplete');
    		return complete;
        }

        self.checkComplete = function () {
        	var result = true;
        	$('.required-field').each(function (index, el) {
        		result = result && testComplete($(el));
        	});
        	self.isComplete(result);
        }

        self.compositionComplete = function () {
        	console.log('compositionComplete');
        	// apply jQuery plugin after composition is complete
        	$('input.landline-phone').each(function (index, el) {
        		var $el=$(el), mask = $el.attr('data-mask-pattern');
        		$el.inputmask(mask).addClass('masked-field'); 
        		console.log('applying mask landline', el, $el);
        	});
        	$('input.mobile-phone').each(function (index, el) {
        		var $el=$(el), mask = $el.attr('data-mask-pattern');
        		$el.inputmask(mask).addClass('masked-field'); 
        		console.log('applying mask mobile', el, $el);
        	});
        	$('input.e-mail').inputmask({
			    mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]",
			    greedy: false,
			    onBeforePaste: function (pastedValue, opts) {
			      pastedValue = pastedValue.toLowerCase();
			      return pastedValue.replace("mailto:", "");
			    },
			    definitions: {
			      '*': {
			        validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
			        cardinality: 1,
			        casing: "lower"
			      }
			    }
			  }).addClass('masked-field');
        	$('input.postcode').inputmask({
        		mask:'',
        		validator: '[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]? [0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}'
        	});

        	$('.required-field').on('focusout', function () {
        		var $el = $(this),
        		complete = testComplete($el);
        		message = complete ? '':'<span class="error-message">This field is required!</span>';
        		if (complete) { 
        			$el.removeClass('incomplete-field')
        		} else {
        			$el.addClass('incomplete-field')
        		}
    			$el.next('section.user-message').html(message);
        	})

        }

        self.proceedPage = function () {
        	var hash;
        	self.checkComplete();
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