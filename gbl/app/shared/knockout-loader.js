/*
Danwin.
Knockout bundled with ko.mapping and custom bindings and components
*/

define([

	'jquery.all', // <-- with ntfbus
	'knockout', 
	'knockout.mapping',

//	'jquery.ui',
	'knockout.sortable',

	'shared/ko.ext', // <-- different custom extenders and bindings
	'shared/htmltemplate', // <-- check necessity
	// 'shared/dialog', // binding for html // <-- check necessity
	'shared/ui.proxy'
	
	], 

	function ($, ko, mapping) {
		'use strict';

		ko.mapping = mapping;
		return ko;
	}
);