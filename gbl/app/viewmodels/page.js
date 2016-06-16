/*Common module for simple text pages*/

define(['durandal/app'], function (app) {
    var ctor = function () {
        this.compositionComplete = function () {
        	// Hide splash screen
        	app.trigger('splash:hide');
        }
        this.deactivate = function () {
        	// show splash screen
        	app.trigger('splash:show');
        }
    };
    
    return ctor;
});