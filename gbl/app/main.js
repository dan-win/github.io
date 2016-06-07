requirejs.config({

    urlArgs: "bust=" +  (new Date()).getTime(), // debug
    //~ urlArgs: "version=1.2.3", // production

    // baseUrl: '../vendor',

    waitSeconds: 15, // timeout settings

    paths: {

        // 'lib':          '../vendor',

        // 'app':          '../app',
        // 'shared':       '../app/shared',

        'jquery':       '../vendor/jquery-1.11.3.min',
        'jquery.ui':        '../vendor/jquery-ui/jquery-ui.1.11.4.interactions.min',
        // 'jquery.mask': '../vendor/jquery.mask', 
        'jquery.inputmask': '../vendor/jquery.inputmask.bundle',
        'jquery.autocomplete': '../vendor/jquery.autocomplete',

        // folder, not js (for ko.mapping(!)):
        'jquery-ui':        '../vendor/jquery-ui',

        // groups jquery wit a minimal plugins (ntfbus)
        // do not include jquery-ui because it is not always necessary
        'jquery.all':       'shared/jquery-loader',

        'knockout':         '../vendor/knockout-3.3.0',

        // this module groups knockout.kernel', 'knockout.mapping', preloads 'jquery':
        'knockout.all':         'shared/knockout-loader',

        'underscore':       '../vendor/underscore-min',
        'underscore.all':   'shared/underscore-loader',
        
        'bootstrap':        '../vendor/bootstrap/js/bootstrap.min',

        'message.bus':  'shared/message.bus',

        'xml2json':     '../vendor/xml2json-light',


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
        'bootstrap': {
            deps: ['jquery'], // dependency of jquery
            exports: 'jQuery'
        },
        'jquery.ui': {
            deps: ['jquery']
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




define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'shared/subdomain-config'],  
    function (system, app, viewLocator, subdomainConfig) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    // Google Analytics:
    if (system.debug()) {
        // Redefine "ga" for dummy function - test
        window.ga = function (cmd, arg1, arg2) {
            console.log('=== Google Analytics Call: ===', cmd, arg1, arg2);
        }
    }

    // init Google Tracker:
    window.ga('create', subdomainConfig.gaKey, subdomainConfig.gaFieldsObject);

    app.title = subdomainConfig.appTitle;

    app.configurePlugins({
        router: true,
        dialog: true,
        // register custom widget~s:
        widget: {
            kinds: [
                'splash'
                ,'form-group-text'
                ,'form-group-dropdown'
                ]
        }
    });

    // CUSTOM CODE:

    // *** Custom data and config ***
    app.customCfg = subdomainConfig;

    // *** Allow inspection for debugging: ***
    if (system.debug()) window.__durandal_app__ == app;

    // CUSTOM CODE (END)

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });

});