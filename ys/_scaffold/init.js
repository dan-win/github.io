// sub-application

// For any third party dependencies, like jQuery, place them in the js folder.
// Configure loading modules from the js directory,
// except for 'js' ones, which are in a sibling
// directory.

// requirejs.config({
// 	baseUrl: '../js/lib',
// 	paths: {
// 			jsapp: '../jsapp',
// 			jquery: 'jquery-1.11.3.min',
// 			bootstrap: 'bootstrap.min',
// 			knockout: 'knockout-3.3.0'
// 		},
// 	shim: { // bootstrap not AMD-compatible, so 'shim' is necessary
// 		bootstrap: {
// 			deps: ['jquery'] // dependency of jquery
// 		},
// 	}
// });

// requirejs(['jsapp/common', './module.js']);


// sub-application

// For any third party dependencies, like jQuery, place them in the js folder.
// Configure loading modules from the js directory,
// except for 'js' ones, which are in a sibling
// directory.

requirejs.config({
	baseUrl: '../js/lib',  // <--- move to js/jsapp/subapp-common.js?
	paths: {
			jsapp: '../jsapp',
			jquery: 'jquery-1.11.3.min',
			jqueryui: 'jquery-ui.1.11.4.interactions.min',
			bootstrap: 'bootstrap.min',
			knockout: 'knockout-3.3.0'

			// appViewModel: './module' // local module with appViewModel
		},
	shim: { // bootstrap not AMD-compatible, so 'shim' is necessary
		bootstrap: {
			deps: ['jquery'] // dependency of jquery
		},
		jqueryui: {
			deps: ['jquery']
		}
	}
});

requirejs(['knockout', 'module.js'], function (ko, appViewModel) {
	ko.applyBindings(new appViewModel());
});