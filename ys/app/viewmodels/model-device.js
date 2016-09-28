define(['underscore.all', 'knockout.all', 'viewmodels/model-base'], function(_, ko, BaseModel){

	/*////////////////////////////////////////////////////////
	//
	// Device
	//
	*/////////////////////////////////////////////////////////

	// To-do: Client device protection - via Auth for devices. Create tokens via JS RSA lib. (see: http://kjur.github.io/jsrsasign/; https://github.com/firebase/quickstart-js/blob/master/auth/exampletokengenerator/auth.html)
	// Use Firebase Auth caps
	
	var StructDevice = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'New Device', data);

		Field( 'Resolution', '-', data);
		Field( 'Browser', '-', data);


		Field( 'Lat', 0, data);
		Field( 'Lon', 0, data);
		Field( 'Address', '', data);

		Field( 'Comment', '', data);

		FieldA( 'Tags', [], data);

		// Default playlist (visible when no schedule defined) 
		Field( 'Channel', null, data);

		return scope;
	}

	var Device = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Device_');

		StructDevice(self, data);

		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructDevice);

		// *** Constant fields ***

		self._rtti = 'class:Device';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***
		//...
	}

	return {
		StructDevice: StructDevice,
		Device: Device
	}

});