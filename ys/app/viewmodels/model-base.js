// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.model_base = modfunc(
			_, ko
			);
	}
}

//model-base.js
define(['underscore.all', 'knockout.all'], function(_, ko){

	function renderTimestamp () {
		function align2Digits (value) {
			var s = value.toString();
			return (s.length > 1) ? s : '0'+s;
		}
		var d = new Date();
		return d.getFullYear() + 
				'-' + align2Digits( d.getMonth() + 1 ) + 
				'-' + d.getDate() + 
				' ' + align2Digits(d.getHours()) + 
				':' + align2Digits(d.getMinutes()) + 
				':' + align2Digits(d.getSeconds()); 
	}

	var StructPersistent = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		// Id in remote database (null for a new object):
		Field( 'StorageID', _.uniqueId, data); // <-- for "default" here - pass function, not a value! 

		Field( 'CreatedTime', renderTimestamp, data);  // <-- for "default" here - pass function, not a value!
		Field( 'ModifiedTime', renderTimestamp, data); // <-- for "default" here - pass function, not a value!

		return scope;
	}

	var IFUpdate = function (scope, factory) {
		// Interface which supports updating of fields without creation of thei instances
		// Factory must support "struct protocol" (see above)
		_.assertDefined(scope, 'IFUpdate cannot be applied to undefined object!')

		scope.updateValues = function (data) {
			console.log('*updating value~s, factory:', factory, 'data:', data);
			factory(scope, data);
			console.log('UPDATED: ', scope, ko.toJS(scope));
		}

		scope.toJS = function () {
			var data = factory({}, scope);
			_.assertDefined(data, 'IFUpdate.toJS error: factory returns empty object');
			console.log('toJS result: ', ko.toJS(data));
			return ko.toJS(data);
		}

		// visible representation of StorageID:
		scope.displayStorageID = function () {
			var 
				sID = scope.StorageID().toString();
			while (sID.length < 7) sID = '0'+sID;
			return '#'+sID;
		}
	}

	/*
	* Use in mixins, snippet to apply and iitialize fields:
	* StructPersistent(scope, data); // apply 'StorageID', 'CreatedTime', 'ModifiedTime'
	*
	*/


	return {
		'StructPersistent': StructPersistent,
		'IFUpdate': IFUpdate
	}

});