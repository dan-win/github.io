define(['plugins/router', 'durandal/app', 'knockout', 'underscore', 'jquery', 'shared/FormModel', 'jquery.inputmask', 'jquery.autocomplete'], 
	function (router, app, ko, _, $, FormModel) {

		// Prepare data masks

		window.Inputmask.extendAliases({
			'money-integer': {
				// 'mask': '[9,[9[9[9]]]]',
				// 'mask': '[[9,]9{0,3}]{*}',
				// 'mask': '[[[[9,]9]9]9]{0,4}',
				// 'mask': '[,[9[9[9]]]]',
				// 'mask': '[[[[[[[9,]9]9]9,]9]9]9]',
				'mask': '9{*}',
				'repeat': 3,
				'greedy': false,
				'numericInput': true,
				'rightAlign': true,
				'groupSeparator': ',',
				'skipOptionalPartCharacter': ','

			},
			"uk-mobile-phone": {
				'mask': '07999 999999'
				// 'placeholder': '07xxx xxxxxx',

			},
			"uk-landline-phone": {
				'mask': '(09999 99999)|(09999 999999)'
				// 'placeholder': '0xxxx xxxxx(x)',
			},
			'e-mail': {
				'alias': 'email' /*standard validator from Inputmask extensions */
			},
			'uk-postcode': {
				// 'mask': '(%%%% 9AA)|(%%% 9AA)',
				'mask': '%{3,4} 9AA',

				// The good mask, but sophisticated:
				// 'mask':'(A9 9AA)|(A99 9AA)|(AA9 9AA)|(AA99 9AA)|(A9A 9AA)|(AA9A 9AA)',
				'placeholder': '',
				'isComplete': function (buffer, opts) {
					var text = buffer.join('');
					var tmpl = /^(GIR 0AA)|((([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))) [0-9][A-Z]{2})$/;
					console.log('test complete', this, this.el, text, tmpl.test(text));
					return tmpl.test(text);
				},
				'definitions': {
					'A': {
						validator: '[A-Za-z]',
						cardinality: 1,
						casing: 'upper'
					},
					'%': {
						validator: '[0-9A-Za-z]',
						cardinality: 1,
						casing: 'upper'
					}
					// 's': {
					// 	validator: '[ ]',
					// 	cardinality: 1
					// }
				},
				'onincomplete': function (argument) {
					console.log('onincomplete', argument, this);
				},
				'oncomplete': function (argument) {
					console.log('oncomplete', argument, this);
				}
        		// 'validator': '^(GIR 0AA)|((([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))) [0-9][A-Z]{2})$'
			},
			'uk-sortcode': {
				'mask': '99-99-99'
			}
		});


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


        function isFieldComplete ($el) {
    		var complete = !!$el.val();
    		if ($el.hasClass('masked-field'))
    			complete = $el.inputmask('isComplete');
    		return complete;
        }

        function updateCompleteStatus($el, complete) {
    		message = complete ? '':'<span class="error-message">This field is required!</span>';
    		if (complete) { 
    			$el.removeClass('incomplete-field')
    		} else {
    			$el.addClass('incomplete-field')
    		}
			$el.next('section.user-message').html(message);
    	}

        self.checkCompleteAll = function () {
        	var result = true, flag;
        	$('.required-field').each(function (index, el) {
        		var $el = $(el);
        		flag = isFieldComplete($el);
        		updateCompleteStatus($el, flag);
        		result = result && flag;
        	});
        	self.isComplete(result);
        }

        self.compositionComplete = function () {

        	// apply jQuery plugin after composition is complete

        	// ^([A-PR-UWYZ0-9][A-HK-Y0-9][AEHMNPRTVXY0-9]?[ABEHMNPRVWXY0-9]? {1,2}[0-9][ABD-HJLN-UW-Z]{2}|GIR 0AA)$

        	$('input[data-inputmask-alias]').inputmask().addClass('masked-field');


        	// $('input.postcode').autocomplete({
        	// 	"serviceUrl": function (partialPostcode) {
        	// 		console.log(partialPostcode.replace(/([_ ]+)$/gi,''));
        	// 		return 'https://api.postcodes.io/postcodes/'+partialPostcode.replace(/([_ ]+)$/gi,'%20')+'/autocomplete?limit=99'
        	// 	},
        	// 	"ignoreParams": true,
        	// 	"dataType": "json",
        	// 	"transformResult": function(response, originalQuery) {
        	// 		console.log("transformResult", response, originalQuery);
        	// 		// if (originalQuery.length < 4) return {"suggestions":["Continue typing, please..."]};
        	// 		return {"suggestions":  response["status"]==200 && response["result"] ? response["result"] : []};
        	// 	},
        	// 	"minChars": 3,
        	// 	"showNoSuggestionNotice": true,
        	// 	"noSuggestionNotice": "No matching results",
        	// 	"onSearchError": function () {
        	// 		console.log("onSearchError");
        	// 	},
        	// 	"onSelect": function (suggestion) {
        	// 		console.log('suggestion', suggestion)
        	// 	},
        	// 	// "beforeRender": function (container) {
        	// 	// 	console.log('beforeRender', container);
        	// 	// 	$(container).prepend('<div class="spinner">Wait...</div>');
        	// 	// },
        	// 	"onSearchStart": function () {
        	// 		console.log('onSearchStart', this);
        	// 		$(this).addClass('autocomplete-ajax-wait');
        	// 	},
        	// 	"onSearchComplete": function () {
        	// 		$(this).removeClass('autocomplete-ajax-wait');
        	// 	}

        	// });

        	$('body').on('focusout blur', '.required-field', function (event) {
        		var $el = $(event.currentTarget),
        		complete = isFieldComplete($el);
        		updateCompleteStatus($el, complete);
        	});

        }

        self.proceedPage = function () {
        	var hash;
        	self.checkCompleteAll();
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