define(['plugins/router', 'durandal/app'], function (router, app) {
	return {
		router: router,
		activate: function () {
			router.map([
				// default route:
				{ route: '', title:'Apply Now', moduleId: 'viewmodels/application-page-1', nav: false,
					hash: '#application-page-1'}
				// dynamic route, depends on "pageNo", hash for history :
				,{ route: 'application-page-1', title:'Apply Now', moduleId: 'viewmodels/application-page-1', nav: true, 
					hash: '#application-page-1' }

				,{ route: 'application-page-2/:appId', title:'Application Page 2', moduleId: 'viewmodels/application-page-2', nav: false }
				,{ route: 'application-page-3/:appId', title:'Application Page 3', moduleId: 'viewmodels/application-page-3', nav: false }

				// Visible in navigation:
				,{ route: 'about-us', title:'About', moduleId: 'viewmodels/about-us', nav: true, hash: '#about-us' }
				,{ route: 'contact-us', title:'Contact', moduleId: 'viewmodels/contact-us', nav: true, hash: '#contact-us' }
				,{ route: 'faq', title:'FAQ', moduleId: 'viewmodels/faq', nav: true, hash: '#faq' }

				// Service pages (invisible from navigation)
				,{ route: 'error-page(/:appId)', title:'Error', moduleId: 'viewmodels/error-page', nav: false }
				,{ route: 'privacy-policy', title:'Privacy Policy', moduleId: 'viewmodels/privacy-policy', nav: false, hash:'#privacy-policy' }
				,{ route: 'terms-n-conditions', title:'Terms and Conditions', moduleId: 'viewmodels/terms-n-conditions', nav: false, hash:'terms-n-conditions' }
				,{ route: 'thank-you(/:appId)', title:'Thank You', moduleId: 'viewmodels/thank-you', nav: false }

				,{ route: 'non-ho-thank-you(/:appId)', title:'Thank You', moduleId: 'viewmodels/thank-you', nav: false }

				,{ route: 'non-ho-gtr-thank-you(/:appId)', title:'Thank You', moduleId: 'viewmodels/thank-you', nav: false }


				// ,{ route: 'interstitial', title:'Interstitial', moduleId: 'viewmodels/interstitial', nav: false }


			]).buildNavigationModel();

			// Google Analytics interceptor:
			router.on('router:navigation:complete', function(instance, instruction, router) {  
				// Do not create the tracker object once more - it is already created in "main.js"
				// (once per application)
			    // ga('create', 'UA-XXXXXXXX-X', 'example.com');
			    window.ga('set', 'page', location.pathname + location.search + location.hash);
			    // ^ another option - use page aliases (#hash?)
			    window.ga('send', 'pageview');
			});			
			
			return router.activate();
		}
	};
});