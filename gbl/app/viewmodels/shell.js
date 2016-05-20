define(['plugins/router', 'durandal/app'], function (router, app) {
	return {
		router: router,
		activate: function () {
			router.map([
				// default route:
				{ route: '', title:'Homepage', moduleId: 'viewmodels/application-form', hash: '#homepage'}
				// dynamic route, depends on "pageNo", hash for history :
				,{ route: 'application-form(/:pageNo)', title:'Homepage', moduleId: 'viewmodels/application-form', nav: false, hash: '#homepage' }

				,{ route: 'application-form/2', title:'Application Page 2', moduleId: 'viewmodels/application-form', nav: false }
				,{ route: 'application-form/3', title:'Application Page 3', moduleId: 'viewmodels/application-form', nav: false }

				// Visible in navigation:
				,{ route: 'about-us', title:'About', moduleId: 'viewmodels/about-us', nav: true }
				,{ route: '', title:'Homepage', moduleId: 'viewmodels/welcome', nav: true }
				,{ route: 'contact-us', title:'Contact', moduleId: 'viewmodels/contact-us', nav: true }
				,{ route: 'faq', title:'FAQ', moduleId: 'viewmodels/faq', nav: true }

				// Service pages (invisible from navigation)
				,{ route: 'error-page', title:'Error', moduleId: 'viewmodels/error-page', nav: false }
				,{ route: 'privacy-policy', title:'Privacy Policy', moduleId: 'viewmodels/privacy-policy', nav: false }
				,{ route: 'terms-n-conditions', title:'Terms and Conditions', moduleId: 'viewmodels/terms-n-conditions', nav: false }
				,{ route: 'thank-you', title:'Thank You', moduleId: 'viewmodels/thank-you', nav: false }

				,{ route: 'interstitial', title:'Interstitial', moduleId: 'viewmodels/interstitial', nav: false }


				// { route: 'about-us', title:'About', moduleId: 'viewmodels/about-us', nav: true },
				// { route: '', title:'Apply Now', moduleId: 'viewmodels/welcome', nav: true },
				// { route: 'contact-us', title:'Contact', moduleId: 'viewmodels/contact-us', nav: true },
				// { route: 'faq', title:'FAQ', moduleId: 'viewmodels/faq', nav: true },

				// { route: 'application-page-2', title:'Application Page 2', moduleId: 'viewmodels/application-page-2', nav: false },
				// { route: 'application-page-3', title:'Application Page 3', moduleId: 'viewmodels/application-page-3', nav: false },
				// { route: 'error-page', title:'Error', moduleId: 'viewmodels/error-page', nav: false },
				// { route: 'interstitial', title:'Interstitial', moduleId: 'viewmodels/interstitial', nav: false },
				// { route: 'privacy-policy', title:'Privacy Policy', moduleId: 'viewmodels/privacy-policy', nav: false },
				// { route: 'terms-n-conditions', title:'Terms and Conditions', moduleId: 'viewmodels/terms-n-conditions', nav: false },
				// { route: 'thank-you', title:'Thank You', moduleId: 'viewmodels/thank-you', nav: false },


				// A samle view which not included in a direct navigation:
				// { route: 'page(/:id)', title:'', moduleId: '', hash: '#page', nav: false, icon:'' }

			]).buildNavigationModel();
			
			return router.activate();
		}
	};
});