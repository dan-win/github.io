// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.model_exposition = modfunc(
			_, ko, 
			MODULES.model_base,
			MODULES.config
			);
	}
}

//model-exposition.js
define([
	'underscore.all', 
	'knockout.all', 
	'viewmodels/model-base', 
	'shared/config'], 
function(_, ko, BaseModel, config){

	/*////////////////////////////////////////////////////////
	//
	// Exposition
	//
	*/////////////////////////////////////////////////////////

	var StructExposition = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'New Record', data);

		Field( 'Comment', '', data);

		FieldA( 'Tags', [], data);

		// data as JSON string 
		Field( 'json', '', data);
		Field( 'js', {}, data);

		return scope;
	}

	var Exposition = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Exposition_');

		StructExposition(self, data);

		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructExposition);

		// *** Constant fields ***

		self._rtti = 'class:Exposition_';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***
		//...
	}

	return {
		StructExposition: StructExposition,
		Exposition: Exposition
	}

});