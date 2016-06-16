// All specifics for subdomain "GL"
define(function () {

	// Helper to override config values from URL variables:
	function getQueryVariable (variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0; i<vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == variable) {
				return decodeURIComponent((pair[1]+'').replace(/\+/g, '%20'));
			}
		}
		return null;
	}

	// allow to switch "subdomain" on-the-fly - for testing; 
	// otherwise replace it with a static value:

	var site = getQueryVariable('subdomain') || 'gl'; /* choose "gl" or "gml" */

	// Settings object:

	var settings =  {
		// Global settings:

		// "Switch" between gl | gml:
		site: site

		// common part of the window title:
		,appTitle: {

			gl:'Guarantor Loan', 
			gml: 'Guarantor My Loan'

		}[site]

		// Used on "error-page.html":
		,siteBrandName: {
			gl: 'GuarantorLoan.co.uk',
			gml: 'GuarantorMyLoan.co.uk'

		}[site]

		// logo image (file name with path relative to "index.html"):
		,logoImg: {

			gl: 'img/gl-text-logo.png',
			gml: 'img/gml-text-logo.png'

		}[site]

		// Google Analytics: Settings for 'create' command:
		,gaKey: 'UA-54574851-1'
		,gaFieldsObject: {
			allowAnchor: true // <- allow anchors explicitly
			,cookieDomain: 'auto'
			,campaignName: getQueryVariable('utm_campaign')
		}

		// PCA settings:
		,pcaCode: 'CMPNY15947' // <- test only
		// ,pcaCode: 'GUARA11111' // <- production


		// FLG settings (constant fields)
		,flg: {

			postUrl:'http://mtc.flg360.co.uk/api/APILeadCreateUpdate.php'
			,key: 'sDbJchXaqgJGpPorWq2W7jejZv494SSM'
			,leadgroup: 49329
			,site: {gl: 16847, gml: 16846}[site]
			,introducer: 0
			,type: 'Posted'
			,status: 'New'
			,reference: getQueryVariable('utm_content') || ''
			,source: getQueryVariable('utm_source') || ''
			,medium: getQueryVariable('utm_medium') || ''
			,term: getQueryVariable('utm_term') || ''

		}


		// Switch test mode on/off:
		,testing: {
			emulateAjax: true
			,flgTestConnection: true // use 'test' as first_name to test transactions
		}

	}

	return settings;
});