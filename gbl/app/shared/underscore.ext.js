//underscore.ext.js
// custom extensions for underscore

// UMD wrapping for module used (for plain JS, AMD or CommonJS modes)
(function (root, factory) {
    if (typeof define === "function" && define.amd) { // AMD mode
        define(["underscore"], factory);
    } else if (typeof exports === "object") { // CommonJS mode
        module.exports = factory(require("underscore"));
    } else {
    	// Module does not define some globals, 
    	// so ignore returned value:
        factory(root._); // Plain JS, "rtl" is in window scope
    }
}(this, function (_) {

//======================
	'use strict';

	_.mixin({
		
		assertTrue: function (value, errmessage) {
			if (!value) throw Error(errmessage || 'Assertion failure: false value: ' + value );
			return value;
		},
		
		assertDefined: function (value, errmessage) {
			if (_.isUndefined(value)) throw Error(errmessage || 'Assertion failure: value is undefined' );
			return value;
		},
		
		renderStr: function (template, data) {
			var buff = template, value;
			for (var name in data) {
				value = data[name];
				value = _.isFunction(value) ? value() : value;
				buff = buff.replace('{'+name+'}', value );
			}
			return buff;
		},

		// renderTimestamp: function () {
		// 	function align2Digits (value) {
		// 		var s = value.toString();
		// 		return (s.length > 1) ? s : '0'+s;
		// 	}
		// 	var d = new Date();
		// 	return d.getFullYear() + 
		// 			'-' + align2Digits( d.getMonth() + 1 ) + 
		// 			'-' + d.getDate() + 
		// 			' ' + align2Digits(d.getHours()) + 
		// 			':' + align2Digits(d.getMinutes()) + 
		// 			':' + align2Digits(d.getSeconds()); 
		// },

		applyReferenceID: function (obj, prefix) {
			obj._rid = _.uniqueId(prefix);
			obj.ReferenceID = function () { return obj._rid; }
		},

		// Unique indentifier, see receipt: http://stackoverflow.com/a/13403498
		qGUID: function (prefix) {
			prefix = prefix || '';
			return prefix+Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);
		}

		// ,checkRTTI: function (obj, classConstructor) {
		// 	return (_.isObject(obj) && obj._rtti && obj._rtti == classConstructor._rtti);
		// }

	});

}));
