// Exports function to call it after completed composition
define(['jquery', 'jquery.inputmask', 'jquery.autocomplete', 'shared/jquery.expand-form-groups'], 


	function ($) {

		// Global settings for mask(s):
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
			"all-caps": {
				'mask': '%{*}',
				'definitions': {
					'%': {
						validator: '[0-9A-Za-z ]',
						cardinality: 1,
						casing: 'upper'
					}
				}
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
				// 'mask': '%{3,4}9AA',

				// The good mask, but sophisticated:
				'mask':'(A9 9AA)|(A99 9AA)|(AA9 9AA)|(AA99 9AA)|(A9A 9AA)|(AA9A 9AA)',
				'placeholder': '',
				// 'isComplete': function (buffer, opts) {
				// 	var text = buffer.join('');
				// 	var tmpl = /^(GIR 0AA)|((([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))) ?[0-9][A-Z]{2})$/;
				// 	console.log('test complete', this, this.el, text, tmpl.test(text));
				// 	return tmpl.test(text);
				// },
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
				'mask': '999999'
			},
			'uk-account': {
				'mask': '99999999[9{0,4}]'
			}
		});

		function Manager() {
			var 
				self = this;

			self.installHelpers = function (args) {

				self.JQ_SEL_MASKED_FIELD = args.JQ_SEL_MASKED_FIELD || 'input[data-inputmask-alias]';
				self.JQ_SEL_FIELD_FEEDBACK = args.JQ_SEL_FIELD_FEEDBACK || 'section.user-message';
				self.JQ_SEL_REQUIRED = args.JQ_SEL_REQUIRED || '.required-field';
				// metaclass to distinguish firlds with validation plugin:
				self.JQ_CLASS_MASKED = 'masked-field';
				self.JQ_CLASS_INCOMPLETE = args.JQ_CLASS_INCOMPLETE || 'incomplete-field';

	        	$(self.JQ_SEL_MASKED_FIELD)
	        		.inputmask()
	        		.addClass(self.JQ_CLASS_MASKED);

	        	console.log('self.JQ_SEL_REQUIRED', self.JQ_SEL_REQUIRED, $(self.JQ_SEL_REQUIRED));

	        	$('body').on('focusout blur', self.JQ_SEL_REQUIRED, function (event) {
	        		var $el = $(event.target),
	        			complete = self.isFieldComplete($el);
	        		console.log('----------->focusout blur');
	        		self.reflectFieldStatus($el, complete);
	        	});

	        	// process all "firld-group" tags:
	        	$(document).expandFormGroups();
			}

	        self.isFieldComplete = function ($el) {
	    		var complete = !!$el.val();
	    		if ($el.hasClass(self.JQ_CLASS_MASKED))
	    			complete = $el.inputmask('isComplete');
	    		return complete;
	        }

	        self.reflectFieldStatus = function ($el, complete) {
	    		var message = complete ? '':'<span class="error-message">This field is required!</span>';
	    		var messageEl;
	    		if (complete) { 
	    			$el
	    				.removeClass(self.JQ_CLASS_INCOMPLETE)
	    				.next(self.JQ_SEL_FIELD_FEEDBACK)
	    				.removeClass('glyphicon-remove')
	    				.addClass('glyphicon-ok');
	    		} else {
	    			$el
	    				.addClass(self.JQ_CLASS_INCOMPLETE)
	    				.next(self.JQ_SEL_FIELD_FEEDBACK)
	    				.addClass('glyphicon-remove')
	    				.removeClass('glyphicon-ok');
	    		}
	    		messageEl = $el.next().filter(self.JQ_SEL_USER_MESSAGE);
	    		if (messageEl.length == 0) {
	    			// in case if input wrapped with "input-group"
	    			messageEl = $el.parent().next().filter(self.JQ_SEL_USER_MESSAGE);
	    		}
				messageEl.html(message);

	    	}

		}

        return new Manager();

	});
