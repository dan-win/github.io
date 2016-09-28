define(['plugins/router', 'durandal/app'], function (router, app) {
	return {
		router: router,
		search: function() {
			//It's really easy to show a message box.
			//You can add custom options too. Also, it returns a promise for the user's response.
			app.showMessage('Search not yet implemented...');
		},
		activate: function () {
			router.map([
				{ route: '', title:'Dashboard', moduleId: 'viewmodels/welcome', nav: true, icon: 'fa-tachometer' },
				{ route: 'assets', title:'Assets', moduleId: 'viewmodels/assets', nav: true, icon: 'fa-cubes' },
				{ route: 'playlists', title:'Playlists', moduleId: 'viewmodels/playlists', nav: true, icon: 'fa-film' },
				{ route: 'channels', title:'Channels', moduleId: 'viewmodels/channels', nav: true, icon: 'fa-plug' },
				{ route: 'displays', title:'Displays', moduleId: 'viewmodels/devices', nav: true, icon: 'fa-television' },
				{ route: 'settings', title:'Settings', moduleId: 'viewmodels/settings', nav: true, icon: 'fa-cog' },
				{ route: 'about', title:'About', moduleId: 'viewmodels/about', nav: true, icon: 'fa-info-circle' },
				// A samle view which not included in a direct navigation:
				{ route: 'composer(/:id)', title:'Playlist Composer', moduleId: 'appComposer/composer', hash: '#composer', nav: false, icon:'' },

				{ route: 'test-dlg', title:'Test dialog', moduleId: 'test/test-dlg', nav: false, icon:'' },


			]).buildNavigationModel();
			
			return router.activate();
		}
	};
});