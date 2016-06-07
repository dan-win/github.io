// Application -wide splash (embed it into "shell.html")
// invisible by default
    define(['durandal/composition','durandal/app','jquery'], function(composition, app, $) {
        var ctor = function() { };
     
        ctor.prototype.activate = function() {
        	// register handlers
        	app.on('splash:show').then(function () {
	        	$('#app-splash').show(500);
        	});
        	app.on('splash:hide splash:deactivate').then(function () {
	        	$('#app-splash').hide(500);
        	});
        };

        ctor.prototype.deactivate = function() {
        	// hide on exit
        	app.trigger('splash:deactivate');
        };

        return ctor;

    });
