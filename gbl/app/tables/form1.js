define(['knockout', 'underscore'], 
	function (ko, _) {

		function FormModel() {
			var self = this, undefined;
			// body...
			/*
			???
			Repaying (Per Month) £<Monthly Payment>
			Total Amount Repayable £<Total Amount Repayable>
			Fixed Representative APR <Rep APR>%
			*/
			function _field(name, defVal) {
				self[name] = ko.observable(defVal);
			}
			function _list(name, value) {
				self[name] = ko.observableArray(value);
			}
			function _property(name, reader, writer) {
				self[name] = ko.computed({read: reader, write: writer, owner: self});
			}
			function _computed(name, code) {
				self[name] = ko.pureComputed(code);
			}
			function _method(name, code) {
				self[name] = code;
			}
			function _fmtCurrency(v, sep) {
				sep = sep || ',';
				var result = [], cnt = 0, text = v.toString();
				for (var i = text.length - 1; i >= 0; i--) {
					result.push(text.charAt(i));
					if (++cnt === 3){
						cnt=0;
						result.push(sep);
					}
				}
				result.reverse();
				return result.join('');
			}

			// Your Loan Summary


function showpay()
    {
    var x = parseInt(document.getElementById('loan_amount').value, 10),
	y = parseInt(document.getElementById('loan_term').value, 10);
	var theint = 25.77;
	var princ = x;
	var term = y;
	var intr = theint / 1200;

	z = princ * intr / (1 - (Math.pow(1 / (1 + intr), term)));
	document.getElementById("monthlypayment").innerHTML 
		= ("&pound;" + parseFloat(Math.round(z * 100) / 100).toFixed(2));
	w = ((Math.round(z * 100) / 100) * (y));
	document.getElementById("totalpayment").innerHTML 
		= ("&pound;" + parseFloat(Math.round(w * 100) / 100).toFixed(2));
    }

    		function updateLoanSummary() {
			    var x = parseInt(self.LoanAmount(), 10),
				y = parseInt(self.LoanTerm(), 10);
				var theint = 25.77;
				var princ = x;
				var term = y;
				var intr = theint / 1200;

				z = princ * intr / (1 - (Math.pow(1 / (1 + intr), term)));
				document.getElementById("monthlypayment").innerHTML 
					= ("&pound;" + parseFloat(Math.round(z * 100) / 100).toFixed(2));
				w = ((Math.round(z * 100) / 100) * (y));
				document.getElementById("totalpayment").innerHTML 
					= ("&pound;" + parseFloat(Math.round(w * 100) / 100).toFixed(2));
				return {
					monthlypayment: parseFloat(Math.round(z * 100) / 100).toFixed(2),
					totalpayment: parseFloat(Math.round(w * 100) / 100).toFixed(2)
				}
    		}

			_computed("RepayingPerMonth",
					/* Note: this function must contain direct calls of
					"fields" which values used in computation.
					E.g., for dependency from "LoanAmount":
					>>> var princ = parseInt(self.LoanAmount(), 10);
					This allows automatic  ("live") re-comutation upon fields changes.
					Note that fields are "functions": amount = self.LoanAmount();
					*/
					function () {
					    var princ = parseInt(self.LoanAmount(), 10),
						var term = parseInt(self.LoanTerm(), 10);
						var theint = 25.77;
						var intr = theint / 1200;

						var z = princ * intr / (1 - (Math.pow(1 / (1 + intr), term)));

						// monthly:
						return parseFloat(Math.round(z * 100) / 100).toFixed(2);
					});

			_computed("TotalAmountRepayable",
					/* Note: this function must contain direct calls of
					"fields" which values used in computation.
					E.g., for dependency from "LoanAmount":
					>>> var princ = parseInt(self.LoanAmount(), 10);
					This allows automatic  ("live") re-comutation upon fields changes.
					Note that fields are "functions": amount = self.LoanAmount();
					*/
					function () {
					    var princ = parseInt(self.LoanAmount(), 10),
						var term = parseInt(self.LoanTerm(), 10);
						var theint = 25.77;
						var intr = theint / 1200;

						var z = princ * intr / (1 - (Math.pow(1 / (1 + intr), term)));

						// total:
						var w = ((Math.round(z * 100) / 100) * (term));

						return parseFloat(Math.round(w * 100) / 100).toFixed(2);
					});

			_field("FixedAPR", '29.0');


			_property("LoanAmount", 
					function () { return _fmtCurrency(self._LoanAmount || 3000) });

			_list("lkpLoanAmount",
					_.map(_.range(1000, 5000+1, 250), function (v) {
						return {"label":_fmtCurrency(v), "value":v}
					}));

			_computed("fmtLoanAmount",
					function () {
						return _fmtCurrency(self["LoanAmount"]());
					});

			_field("LoanTerm",
					{"mapTo":"", "appPage":1,"defVal":36, "pattern":null});

			_list("lkpLoanTerm",
					_.map(_.range(12,60+1, 6), function (v) {
						return {"label": v+' months', "value":v}
					}));

			// _computed("fmtLoanTerm",
			// 		function () {
			// 			return self["LoanTerm"]()+'&nbsp;month(s)';
			// 		});

			_field("LoanPurpose",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_list("lkpLoanPurpose",
					["Car Purchase", "Debt Consolidation", "Holiday", "Home Improvements", "Other"]);

			//About You

			_field("Title",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpTitle",
					["Miss", "Mr", "Mrs", "Ms", "Other"]);

			_field("FirstName",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("SurName",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("BirthDate",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpBirthDate",
					_.range(1, 31, 1));
			_field("BirthMonth",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpBirthMonth",
					_.range(1, 12, 1));
			_field("BirthYear",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpBirthYear",
					_.range(1938, 2000, 1));

			_field("MobilePhone",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("HomePhone",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("Email",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("EmploymentStatus",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpEmploymentStatus",
					["Employed", "Self Employed", "Unemployed", "Retired", "Student", "Benefits"]);

			_field("PayFrequency",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpPayFrequency",
					["Weekly", "Bi-Weekly", "Four Weekly", "Last Working Day of Month", "Specific Date", "Other"]);

			// Current Address

			_field("Postcode",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("AddressLine1",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("AddressLine2",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("CityTown",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			_field("ResidentialStatus",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_list("lkpResidentialStatus",
					["Homeowner", "Private Tenant", "Council Tenant", "Living with Family", "Other"]);

			_field("TimeAtAddress",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});


			_list("lkpTimeAtAddress",
					["More than 3 years", "Less than 3 years"]);

			_computed("isPreviousAddressRequired",
					function () {
						var val = self.TimeAtAddress() || '';
						return val.startsWith('Less');
					});

			_field("PreviousHouse",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("PreviousPostcode",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});

			//Your Bank Details

			_field("SortCode",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});
			_field("BankAccount",
					{"mapTo":"", "appPage":1,"defVal":undefined, "pattern":null});


			_field("AllowEmail",
					{"mapTo":"", "appPage":1,"defVal":true, "pattern":null});
			_field("AllowCall",
					{"mapTo":"", "appPage":1,"defVal":false, "pattern":null});
			_field("AllowPost",
					{"mapTo":"", "appPage":1,"defVal":false, "pattern":null});


			// Part II (About Your Guarantor)

			_field("GrntTitle",
					{"mapTo":"", "appPage":2});
			_field("GrntFirstName",
					{"mapTo":"", "appPage":2});
			_field("GrntSurName",
					{"mapTo":"", "appPage":2});
			_field("GrntMobilePhone",
					{"mapTo":"", "appPage":2, "pattern":null});
			_field("GrntHomePhone",
					{"mapTo":"", "appPage":2, "pattern":null});
			_field("GrntEmail",
					{"mapTo":"", "appPage":2, "pattern":null});
			_field("GrntResidentialStatus",
					{"mapTo":"", "appPage":2});


			// Part III (About Your Finances)
    		_field("NetMonthlyIncome",
					{"mapTo":"", "appPage":3});
    		_field("TotalHouseholdIncome",
					{"mapTo":"", "appPage":3});
    		_field("MortgageRentPayment",
					{"mapTo":"", "appPage":3});
    		_field("MonthlyLoanCommitments",
					{"mapTo":"", "appPage":3});
    		_field("Food",
					{"mapTo":"", "appPage":3});
    		_field("Utilities",
					{"mapTo":"", "appPage":3});
    		_field("Transport",
					{"mapTo":"", "appPage":3});
    		_field("OtherOutgoings",
					{"mapTo":"", "appPage":3});

			
			self.toXML =function () {
				return [
					// ,'<?xml version="1.0" encoding="UTF-8"?>',
					// ,'<data>',
					//   '<lead>',
					//     '<key>',sDbJchXaqgJGpPorWq2W7jejZv494SSM,'</key>',
					//     '<leadgroup>',49329,'</leadgroup>',
					//     '<site>',16847,'</site>',
					//     '<introducer>',0,'</introducer>',
					//     '<type>',Posted,'</type>', //was: "GML Direct" 
					//     '<status>',New,'</status>',
					//     '<reference>','','</reference>', //was: Ref1
					//     '<source>','','</source>', //was: GL
					//     '<medium>','','</medium>', // was: Direct
					//     '<term>','','</term>', // was: Direct
					//     '<title>',Mr,'</title>',
					//     '<firstname>',Christopher,'</firstname>',
					//     '<lastname>',Baxter,'</lastname>',
					//     '<phone1>',07917646265,'</phone1>',
					//     '<phone2>',01603561110,'</phone2>',
					//     '<email>',chrisb@guarantormyloan.co.uk,'</email>',
					//     '<address>',25 Surrey Street,'</address>',
					//     '<address2>',,'</address2>',
					//     '<address3>',,'</address3>',
					//     '<towncity>',Norwich,'</towncity>',
					//     '<postcode>',NR1 3NX,'</postcode>',
					//     '<dobday>',10,'</dobday>',
					//     '<dobmonth>',10,'</dobmonth>',
					//     '<dobyear>',1974,'</dobyear>',
					//     '<contactphone>',Yes,'</contactphone>',
					//     '<contactemail>',Yes,'</contactemail>',
					//     '<contactmail>',No,'</contactmail>',
					//     '<data1>',5000,'</data1>',
					//     '<data2>',48,'</data2>',
					//     '<data3>',Home Improvements,'</data3>',
					//     '<data5>',Private Tenant,'</data5>',
					//     '<data6>',More than 3 years,'</data6>',
					//     '<data7>',,'</data7>',
					//     '<data8>',,'</data8>',
					//     '<data9>',000099,'</data9>',
					//     '<data10>',01234567,'</data10>',
					//     '<data11>',Part-Time Employed,'</data11>',
					//     '<data16>',Weekly,'</data16>',
					//   '</lead>',
					// ,'</data>',

				].join('');
			}

		}

		// return {FormModel: FormModel}

		return FormModel;

	});
