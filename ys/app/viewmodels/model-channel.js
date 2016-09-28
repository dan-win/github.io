define(['underscore.all', 'knockout.all', 'viewmodels/model-base'], function(_, ko, BaseModel){

	/*////////////////////////////////////////////////////////
	//
	// Channel
	//
	*/////////////////////////////////////////////////////////

	var StructChannel = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		/* Field('StorageID'), 
		*  Field('CreatedTime'), 
		*  Field('ModifiedTime'): */ 
		BaseModel.StructPersistent(scope, data); 

		Field( 'Label', 'New Channel', data);

		Field( 'Comment', '', data);

		FieldA( 'Tags', [], data);

		// Default playlist (visible when no schedule defined) 
		Field( 'DefaultPlaylist', null, data);

		// List of playlists IDs 
		FieldA( 'Playlists', [], data);

		return scope;
	}

	var Channel = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'Channel_');

		StructChannel(self, data);

		// Implement "updateValues" method which binded with the appropriate factory:
		BaseModel.IFUpdate(self, StructChannel);

		// *** Constant fields ***

		self._rtti = 'class:Channel';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Editor context ***
		//...
	}

	return {
		StructChannel: StructChannel,
		Channel: Channel
	}

});