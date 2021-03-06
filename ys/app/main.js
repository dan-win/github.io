﻿requirejs.config({

    urlArgs: "bust=" +  (new Date()).getTime(), // debug
    //~ urlArgs: "version=1.2.3", // production

    // baseUrl: '../vendor',

    waitSeconds: 15, // timeout settings

    paths: {

        // 'lib':          '../vendor',

        // 'app':          '../app',
        // 'shared':       '../app/shared',

        'json2' :       '../vendor/json2',

        'jquery':       '../vendor/jquery-1.11.3.min',
        'jquery.ui':        '../vendor/jquery-ui/jquery-ui.1.11.4.interactions.min',

        // folder, not js (for ko.mapping(!)):
        'jquery-ui':        '../vendor/jquery-ui',

        // aliases for jquery-fileupload:
        'jquery-fileupload':  '../vendor/jquery-fileupload/js',
        'jquery.ui.widget': '../vendor/jquery-fileupload/js/vendor/jquery.ui.widget',

        // groups jquery wit a minimal plugins (ntfbus)
        // do not include jquery-ui because it is not always necessary
        'jquery.all':       'shared/jquery-loader',

        'knockout':         '../vendor/knockout-3.3.0',
        'knockout.mapping':     '../vendor/knockout.mapping.2.4.1',
        'knockout.sortable':    '../vendor/knockout-sortable.min',

        // this module groups knockout.kernel', 'knockout.mapping', preloads 'jquery':
        'knockout.all':         'shared/knockout-loader',

        'underscore':       '../vendor/underscore-min',
        'underscore.all':   'shared/underscore-loader',
        
        'bootstrap':        '../vendor/bootstrap/js/bootstrap.min',
        'amplify':        '../vendor/amplify-1.1.2/amplify',
        'leaflet':         '../vendor/leaflet/js/leaflet',
        'chart':          '../vendor/chartjs/js/Chart.min',
        'knockout.chart':   '../vendor/knockout.chart',

        'firebase':         '../vendor/firebase/firebase',

        'message.bus':  'shared/message.bus',


        // 'templates':        '../templates'

        // DURANDAL:
        'text': '../vendor/text',
        'durandal':'../vendor/durandal/js',
        'plugins' : '../vendor/durandal/js/plugins',
        'transitions' : '../vendor/durandal/js/transitions'

        // appViewModel: './module' // local module with appViewModel
    },
    shim: { // bootstrap not AMD-compatible, so 'shim' is necessary
        'knockout': {
            deps: ['jquery'] // see: http://blog.scottlogic.com/2014/02/28/developing-large-scale-knockoutjs-applications.html
        },
        'knockout.mapping': {
            deps: ['json2', 'knockout']  // <- way to inject "json2" script
        },
        // 'knockout.sortable': {
        //     deps: ['knockout','jquery.ui']
        // },
        'bootstrap': {
            deps: ['jquery'], // dependency of jquery
            exports: 'jQuery'
        },
        'jquery.ui': {
            deps: ['jquery']
        },
        'amplify': {
            deps: ['jquery'],
            exports: 'amplify'
        }

    }
    //,
    
    // //~ // global dependencies
    // deps: ['jquery', 'knockout', 'knockout.mapping', 'jqueryui', 'bootstrap'],
    
    // //~ // callback
    // callback: function($, ko, mapping){
    //  ko.mapping = mapping;
    // }
});


// Custom addition to setup "console.log", "_TRACE_", etc.,
function setupConsole(config){
    // Some ides from: http://tobyho.com/2012/07/27/taking-over-console-log/
    var console = window.console;

    if (window._TRACE_) 
        throw "'window._TRACE_' already defined!";
    window._TRACE_ = console ?
        function () {console.log.apply(console, arguments);}
        :
        _.noop;

    if (window._ERR_) 
        throw "'window._ERR_' already defined!";
    window._ERR_ = function () {
            throw Array.prototype.slice.apply(arguments).join(' ')
        };

    if (!console) {
        window.console = {
            'log': _.noop, 
            'warn': _.noop, 
            'error': _.noop
        };
        return;
    }
    function intercept(method){
        var original = console[method]
        console[method] = function(){
            // do sneaky stuff
            if (original.apply){
                // Do this for normal browsers
                original.apply(console, arguments)
            }else{
                // Do this for IE
                var message = Array.prototype.slice.apply(arguments).join(' ')
                original(message)
            }
        }
    }
    var methods = ['log', 'warn', 'error']
    for (var i = 0; i < methods.length; i++)
        intercept(methods[i])
}

// var setupConsole = function () {}


define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'shared/config', 'components/custom-dialog'],  
    function (system, app, viewLocator, config, customDialog) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    // Move to module (?):
    setupConsole(config);

    app.title = 'yScreens';

    app.configurePlugins({
        router: true,
        dialog: true,
        widget: {
            // register widget from folder "widgets/mapview"
            'kinds': ['map-widget', 'piechart-widget']
        }
    });

    // CUSTOM CODE:

    // *** Custom data and config ***
    app.ys = {};
    app.ys.config = {
    }

    // *** Allow inspection for debugging: ***
    if (system.debug()) window.__durandal_app__ == app;

    // add custom dialog as app "plugin":
    app.customDialog = customDialog;

    // CUSTOM CODE (END)

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });

});