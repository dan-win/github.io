requirejs.config({

    urlArgs: "bust=" +  (new Date()).getTime(), // debug
    //~ urlArgs: "version=1.2.3", // production

    // baseUrl: '../vendor',

    waitSeconds: 15, // timeout settings

    paths: {

        'jquery':       '../vendor/jquery-1.11.3.min',

        'jquery.inputmask': '../vendor/jquery.inputmask.bundle',
        'jquery.autocomplete': '../vendor/jquery.autocomplete',

        'knockout':         '../vendor/knockout-3.3.0',

        
        'bootstrap':        '../vendor/bootstrap/js/bootstrap.min',


        'xml2json':     '../vendor/xml2json-light',

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
            system.log('=== Google Analytics Call: ===', cmd, arg1, arg2);
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


    // register handlers for page splash
    app.on('splash:show').then(function () {
        $('#app-splash').show(500);
    });
    app.on('splash:hide splash:deactivate').then(function () {
        $('#app-splash').hide(500);
    });

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