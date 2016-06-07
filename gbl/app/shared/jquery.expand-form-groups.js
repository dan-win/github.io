
// jQuery plugin to init form group elements
(function (root, factory) {

	if (typeof define === "function" && define.amd) { // AMD mode
		define(["jquery"], factory);
	} else if (typeof exports === "object") { // CommonJS mode
		factory(require("jquery"));
	} else {
		// this module does not export anything into "window" namespace:
		factory(root.$); // Plain JS
	}

}(this, function ($) {

	$.fn.expandFormGroups = function (options) {

		var autoId = 0;

		options = options || {};

		$(this).find(options.selector || 'field-group').each(function (index, el) {

				var
					$wrapper = $(el),
					// remove parent, preserve children:
					$formGroup = $wrapper.wrap(
							$('<div/>')
								.addClass('form-group')
						).parent(),
					$control = $formGroup.find('input,select,checkbox'),
					$label = $formGroup.find('label'),
					ctrlId = ($control.attr('id')) || ($control.attr('name')) || ('ctrl_'+ ++autoId ),
					eventName = ($wrapper.attr('data-event')) || options.event || null,
					glyphicon = $wrapper.attr('data-glyphicon') || options.glyphicon,
					feedback = ($wrapper.attr('data-feedback') === 'true') || options.feedback;

				// console.log($wrapper, $formGroup, $control, $label, '-options', options);

				// console.log('glyphicon for: ',ctrlId, '"'+$wrapper.attr('data-glyphicon')+'"', );


				// console.log('data-feedback', $wrapper.attr('data-feedback'), typeof($wrapper.attr('data-feedback')), ($wrapper.attr('data-feedback')==='true'));
				console.log(feedback);

				$wrapper.children().unwrap();

				// if (options.feedback) 
				//     $wrapper.append('<span class="glyphicon form-control-feedback" aria-hidden="true"></span>');

				// set up attributes
				$label
					.attr('for', ctrlId)
					.addClass('form-label control-label');
				$control
					.addClass('form-control')
					.attr('name', ctrlId)
					.attr('id', ctrlId);

				// console.log('elements', $collection, 'LABEL>>>', $label, 'CONTROL>>>', $control);

				// console.log('$wrapper', $wrapper);

				if (glyphicon) {
					console.log('adding glyphicon for: ',ctrlId);
					$control
						.wrap(
							$('<div/>')
								.addClass('input-group'));
					$('<span/>')
						.addClass('input-group-addon left')
						.insertBefore($control)
						.append(
							$('<i/>')
								.addClass('glyphicon')
								// .addClass('glyphicon-ok'));
								.addClass(glyphicon));
				}
						
				if (feedback) {
					$('<span/>')
						.addClass('glyphicon form-control-feedback')
						.attr('aria-hidden', true)
						.insertAfter( 
							(glyphicon) ? $control.parent('.input-group'): $control);

					$formGroup.addClass('has-feedback');
					// $formGroup.append(
					// 	$('<section/>')
					// 		.addClass('user-message'));
				}

				// set notification event, if any:
				if (eventName)
					$('body').on('change', '#'+ctrlId, function (event) {
						$('body').triggerHandler(eventName, [ctrlId, $(event.target).val()]);
						console.log('fired', eventName);
					})

		});

		return this;

	}

}));