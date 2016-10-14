//auth-spec.js 



describe("Auth", function() {
	var auth;

	// Stub for  DOM
	function DomAdapter (formId) {
		var
			self = this, 
			formId = assertDefined(formId, 'Form ID is required!');

		self.onsubmit = null;

		self.getForm = function () {
			throw 'Not implemented';
		}

		self.getFormField = function (inputName) {
			TRACE('Form field requested:', inputName);
			if ('email' == inputName) return TestEnvironment['inputEmail'];
			if ('token' == inputName) return TestEnvironment['inputToken'];			
			// return self.getForm()[inputName].value;
		}

		self.getFormAttribute = function (attrName) {
			if (attrName == 'data-bigauth-token') return 'API-TOKEN';
		}

		self.addBodyClass = function (className) {
			TestEnvironment['bodyCSS'][className] = true; 
		}

		self.removeBodyClass = function (className) {
			var undefined;
			TestEnvironment['bodyCSS'][className] = undefined; 
		}

		self.submit = function () {
			self.onsubmit();
		}

	}

	// Stub ro IP resolver
	function ResolveIP (options) {
		return {
			run: function (argument) {
				options.onDone('192.168.0.1');
			}
		}
	}


	// execute once
	beforeAll(function() {});

	// execute once
	afterAll(function() {});

	// execute before each test
	beforeEach(function() {
		TestEnvironment = {
			'cookies': {},
			'state': null,
			'error': false,
			'bodyCSS': {},
			'urlQuery': {},
			'urlHash': '',

			'inputEmail': '',
			'inputToken': '',

			// ajax:
			'respondSuccess': true,
			'statusCode': 200
		};
		E = TestEnvironment;

		// Cookie.prototype.environment = TestEnvironment;
		// AjaxAdapter.prototype.environment = TestEnvironment;

	});

	// execute after each test
	afterEach(function() {});

	// it("contains spec with an expectation", function() {
	// 	expect(true).toBe(true);
	// });

	// no session cookie

	it("No session cookie", function() {
		E.cookies['hl-session'] = null;
		auth = new Auth (Cookie, DomAdapter, AjaxAdapter, ResolveIP);
		auth.run();
		expect(auth.state()).toEqual('ST_WAITING_EMAIL_INPUT');
		TRACE('test 1 ', auth.state());
	});

	it("Request new token (with positive response)", function() {
		// Preset successfull response with code 200:
		AjaxAdapter.respondSuccess = true;
		AjaxAdapter.statusCode = 200;

		E.cookies['hl-session'] = null;
		E.inputEmail = 'admin@test.net';
		auth = new Auth (Cookie, DomAdapter, AjaxAdapter, ResolveIP);
		auth.run('ST_WAITING_EMAIL_INPUT');
		auth.submitForm();
		expect(auth.state()).toEqual('ST_WAITING_TMP_TOKEN');
	});


});

