// model-auth
define(['underscore.all', 'knockout.all'], function(_, ko){

	var StructUser = function(scope, data) {
		// Persistent fields for I/O
		scope = scope || {};
		var
			Field = ko._FieldFactory_(scope, ko.observable),
			FieldA = ko._FieldFactory_(scope, ko.observableArray);

		Field( 'Username', '', data);
		Field( 'Password', '', data);

		Field( 'Email', '', data);

		Field( 'FirstName', '', data);
		Field( 'LastName', 'Noname', data);

		return scope;
	}

	var User = function (data) {
		var self = this;

		// Session-ony resource Id for message binding
		_.applyReferenceID(self, 'User_');

		StructUser(self, data);

		// *** Constant fields ***

		self._rtti = 'class:User';
		_.assertTrue(self !== window, 
			'"'+self._rtti+'"" function is a constructor, call it with "new"!');

		// *** Computed fields ***
		
	}

	// ---

	return {
		StructUser: StructUser,
		User: User
	}

});
