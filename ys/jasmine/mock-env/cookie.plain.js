//cookie.plain.js

// ====== redefine COOKIES ======

function Cookie(document, name, hours, path, domain, secure) {
	var self = this, undefined;
	self.environment = TestEnvironment;

	self.name = name;  self.value = null;
	self.store = function (  ) {
		self.environment.cookies[self.name] = self.value;
	}

	self.load = function(asObject) {
		var 
			value = self.environment.cookies[self.name],
			exists =  !!value;
		if (exists) self.value = value;
		return exists;
	}

	self.remove = function(  ) {
		self.environment.cookies[self.name] = undefined;
	}
}
