// ajax-stub.js

	function AjaxAdapter (apiToken, onStart, onFinish) {
		var self = this;
		
		self.environment = TestEnvironment;

		// Switch test to success / error fake response:
		var respondSuccess = assertDefined(self.environment.respondSuccess, 
			'respondSuccess value missed in AjaxAdapter!'); // (Code 500?)
		var statusCode = assertDefined(self.environment.statusCode, 'statusCode value missed in AjaxAdapter!');

		console.log('AjaxAdapter created');


		/*////////////////////////////////////////////////////////////////////////////
		//
		//   Endpoints
		// 
		*/////////////////////////////////////////////////////////////////////////////

		var responses = {
				"epTokenRequest" : {
					200: {
						"url": "http://api.hugelogin.com/tokenrequest/174/",
						"email": "admin@test.net",
						// "session_token": "TMP-TOKEN",
						"is_sms": false,
						"message": "An email has been sent with confirm link",
						"status_code": 200,
						"created": "2016-01-08T17:01:32.608541Z"	
					}
				},

				/*////////////////////////////////////////////////////////////////////////////
				//   Confirm Tmp Token
				*/////////////////////////////////////////////////////////////////////////////

				"epTokenConfirm" : {
					200: {
						"url": "http://api.hugelogin.com/tokenconfirm/40/",
						"session_token": "SESSION-TOKEN",
						"email": "admin@test.net",
						"message": "Token confirmed, session token created",
						"status_code": 200,
						"created": "2016-01-08T17:10:19.180136Z"
					},
					/* Response on invalid request*/
					400: {
						"url": "http://api.hugelogin.com/tokenconfirm/27/",
						"session_token": "",
						"email": "",
						"message": "400",
						"status_code": 400,
						"created": "2016-01-08T17:06:33.345558Z"
					}
				},

				/*////////////////////////////////////////////////////////////////////////////
				//   Confirm Session
				*/////////////////////////////////////////////////////////////////////////////

				"epSessionConfirm" : {
					200: {
						"url": "http://api.hugelogin.com/session/79/",
						"session_token": "SESSION-TOKEN",
						"email": "admin@test.net",
						"message": "Session is valid",
						"status_code": 200,
						"is_authenticated": true,
						"created": "2016-01-08T17:13:13.700673Z"
					},
					/* Response on invalid request*/
					400: {
						"url": "http://api.hugelogin.com/session/29/",
						"session_token": "",
						"email": "",
						"message": "401",
						"status_code": 400,
						"created": "2016-01-08T17:12:31.414089Z"
					}
				},

				/*////////////////////////////////////////////////////////////////////////////
				//   Logout
				*/////////////////////////////////////////////////////////////////////////////
				"epDisconnect" : {
					200: {
						"url": "http://api.hugelogin.com/disconnect/16/",
						"session_token": "",
						"provider_id": "RCSRWmnwjc",
						"email": "admin@test.net",
						"message": "Session disconnected",
						"status_code": 200,
						"created": "2016-01-08T17:16:13.963702Z"
					},
					/* Response on invalid request*/
					400: {
						"url": "http://api.hugelogin.com/disconnect/30/",
						"session_token": "",
						"provider_id": "",
						"email": "",
						"message": "400",
						"status_code": 400,
						"created": "2016-01-08T17:15:18.031376Z"
					}
				}
			}

		self.getQueryVariable = function (variable) {
			return self.environment.urlQuery[variable];
		}

		/*////////////////////////////////////////////////////////////////////////////
		//   Dispatcher helpers
		*/////////////////////////////////////////////////////////////////////////////
		self.request = function (endpoint, state_done, state_err) {
			// set transient state:
			onStart();
			// reuest endpoint:
			if (self.respondSuccess) {
				onFinish (state_done)(responses[endpoint][self.statusCode]);
			} else {
				onFinish (state_err)(responses[endpoint][self.statusCode]);		
			}
		}


	}


//======================================
	