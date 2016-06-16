// Viewmode for pages where "application id" is necessary
define(['durandal/app', 'viewmodels/page'], function (app, page) {
	// Here is page is a module function, can be overriden here....

	page.prototype.activate = function(appId) {
		// extract :appId from url args:
		this.appId = appId
		this.cfg = app.customCfg
	};

    return page;
});