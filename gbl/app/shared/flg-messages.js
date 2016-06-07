define(function (require) {
	var
		$ = require('jquery'),
		cfg = require('shared/subdomain-config'),
		parser = require('xml2json');


	function escapeXmlChars(str) {
		if(typeof(str) == "string")
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		else
			return str;
	}

	function unescapeXmlChars(str) {
		return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
	}

	function _get (obj, name, nospace) {
		var value = obj[name];
		if (typeof value === 'undefined')
			throw new Error(
				'FLG message mailformed:\
			 	 Required field missed: ' + name);
		if (!!nospace) value = value.replace(/ /gi, '');
		return escapeXmlChars(value);
	}

	function _optional (obj, name, nospace) {
		if (name in obj) {
			var value = obj[name];
			if (!!nospace) value = value.replace(/ /gi, '');
			return escapeXmlChars(obj[name]);
		}
		return '';
	}

	function _choice (obj, name, onTrue, onFalse) {
		return escapeXmlChars((_optional(obj, name)) ? onTrue : onFalse);
	}

	// export functions:

	return {

		// Message for transaction "create new lead" (1):
		encodeCreateLeadMessage: function (fieldsArray) {
			var 
				a = fieldsArray,
				g = cfg.flg;
			return [
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<data>',
				  '<lead>',

				  	// XML tag: 	file name in 'config':

				    '<key>',		_get(g, 'key'),	
				    '</key>',
				    '<leadgroup>',	_get(g, 'leadgroup'),
				    '</leadgroup>',
				    '<site>',		_get(g, 'site'),
				    '</site>',
				    '<introducer>',	_get(g, 'introducer'),
				    '</introducer>',
				    '<type>',		_get(g, 'type'),
				    '</type>', 
				    '<status>',		_get(g, 'status'),
				    '</status>',
				    '<reference>',	_get(g, 'reference'),
				    '</reference>', 
				    '<source>',		_get(g, 'source'),
				    '</source>', 
				    '<medium>',		_get(g, 'medium'),
				    '</medium>', 
				    '<term>',		_get(g, 'term'),
				    '</term>', 

				  	// XML tag: 	file name in form:

				    '<title>',		_get(a, 'title'),
				    '</title>',
				    '<firstname>',	(cfg.testing.flgTestConnection) ? 'flg' : _get(a, 'first_name'),
				    '</firstname>',
				    '<lastname>',	(cfg.testing.flgTestConnection) ? 'test' : _get(a, 'surname'),
				    '</lastname>',
				    '<phone1>',		_get(a, 'mobile_phone', 'nospace'),
				    '</phone1>',
				    '<phone2>',		_get(a, 'home_phone', 'nospace'),
				    '</phone2>',
				    '<email>',		_get(a, 'email'),
				    '</email>',
				    '<address>',	_get(a, 'address_line1'),
				    '</address>',
				    '<address2>',	_get(a, 'address_line2'),
				    '</address2>',
				    '<address3>',	,'</address3>', // <-- not used
				    '<towncity>',	_get(a, 'city_town'),
				    '</towncity>',
				    '<postcode>',	_get(a, 'postcode', 'nospace'),
				    '</postcode>',
				    '<dobday>',		_get(a, 'birth_day'),
				    '</dobday>',
				    '<dobmonth>',	_get(a, 'birth_month'),
				    '</dobmonth>',
				    '<dobyear>',	_get(a, 'birth_year'),
				    '</dobyear>',
				    '<contactphone>', _choice(a, 'allow_call', 'Yes', 'No'),
				    '</contactphone>',
				    '<contactemail>',_choice(a, 'allow_email', 'Yes', 'No'),
				    '</contactemail>',
				    '<contactmail>',_choice(a, 'allow_post', 'Yes', 'No'),
				    '</contactmail>',
				    '<data1>',		_get(a, 'loan_amount'),
				    '</data1>',
				    '<data2>',		_get(a, 'loan_term'),
				    '</data2>',
				    '<data3>',		_get(a, 'loan_purpose'),
				    '</data3>',
				    '<data5>',		_get(a, 'residential_status'),
				    '</data5>',
				    '<data6>',		_get(a, 'time_at_address'),
				    '</data6>',
				    '<data7>',		_optional(a, 'previous_postcode'),// <- allow optional
				    '</data7>',
				    '<data8>',		_optional(a, 'previous_house'),// <- allow optional
				    '</data8>', 
				    '<data9>',		_get(a, 'sort_code'),
				    '</data9>',
				    '<data10>',		_get(a, 'bank_account'),
				    '</data10>',
				    '<data11>',		_get(a, 'employment_status'),
				    '</data11>',
				    '<data16>',		_get(a, 'pay_frequency'),
				    '</data16>',
				  '</lead>',
				'</data>'

			].join('');
		},
		encodeUpdateLeadGuarantorMessage: function (fieldsArray) {
			var 
				a = fieldsArray,
				g = cfg.flg;
			return [
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<data>',
				  '<lead>',
				  	// XML tag: 	file name in 'config':

				    '<key>',		_get(g, 'key'),	
				    '</key>',

				  	// XML tag: 	file name in form:

				    '<id>', 		_get(a, 'app_id'),
				    '</id>',
				    '<data25>',		_get(a, 'title'),
				    '</data25>',
				    '<data26>',		_get(a, 'first_name'),
				    '</data26>',

				    '<data27>',		_get(a, 'surname'),
				    '</data27>',

				    '<data29>',		_get(a, 'mobile_phone', 'nospace'),
				    '</data29>',
				    '<data30>',		_get(a, 'home_phone', 'nospace'),
				    '</data30>',
				    '<data31>',		_get(a, 'email'),
				    '</data31>',

				    '<data39>',		_get(a, 'residential_status'),
				    '</data39>',

				  '</lead>',
				'</data>'
			].join('');				
		},

		encodeUpdateLeadFinancesMessage: function (fieldsArray) {
			var 
				a = fieldsArray,
				g = cfg.flg;
			return [
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<data>',
				  '<lead>',

				  	// XML tag: 	file name in 'config':

				    '<key>',		_get(g, 'key'),	
				    '</key>',

				  	// XML tag: 	file name in form:

				    '<id>', 		_get(a, 'app_id'),
				    '</id>',
				    '<data17>',		_get(a, 'net_monthly_income'),
				    '</data17>',
				    '<data18>',		_get(a, 'total_household_income'),
				    '</data18>',
				    '<data19>',		_get(a, 'mortgage_rent_payment'),
				    '</data19>',
				    '<data20>',		_get(a, 'monthly_loan_commitments'),
				    '</data20>',
				    '<data21>',		_get(a, 'food'),
				    '</data21>',
				    '<data22>',		_get(a, 'utilities'),
				    '</data22>',
				    '<data23>',		_get(a, 'transport'),
				    '</data23>',
				    '<data24>',		_get(a, 'other_outgoings'),
				    '</data24>',
				  '</lead>',
				'</data>'				
			].join('');				
		},

		decodeResponseMessage: function (response) {
			response = response || '';
			return parser.xml2json(response)['result']; // response contains the parent "result" with payload
		}
	}
});
