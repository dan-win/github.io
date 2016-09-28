define([
    'plugins/http', 
    'plugins/router',
    'durandal/app', 
    'knockout', 
    'underscore', 
    'jquery', 
    'viewmodels/model-display', 
    'shared/tableview'], 
function (http, router, app, ko, _, $, ModelLib, TableViewFactory) {
    //Note: This module exports an object.
    //That means that every module that "requires" it will get the same object instance.
    //If you wish to be able to create multiple instances, instead export a function.
    //See the "welcome" module for an example of function export.



    /*
    * Snippet how to pass data between views:

    overview.onElementClick = function (e) {
        var element = this, // The idea is that you need the clicked element for the next line of code
            koDataForElement = ko.dataFor(element);

        router.navigate('details/' + koDataForElement.id);
    }
    ....
    // in a target view:
    details.activate = function (id) {
        // id is the parameter we defined for the route. Now you are free to leverage it inside your second view!
    };    

    */

    function compose (item) {
        // body...
        // ID?
        // var composer = ModelComposer.Composer();
        // composer.viewUrl = 'appComposer/composer';
        // app.showDialog();

        // app.customDialog({
        //     'buffer': ModelComposer.Composer(), 
        //     'attrFilter': attrFilter, 
        //     'viewUrl': 'appComposer/composer',
        //     'cssClass' : 'dialog-fullscreen'
        // }).waitConfirm();
        console.log('"compose" called...');
        try {
            router.navigate('composer/' + item.StorageID());
        } catch (e) {console.log('error in compose: ', e)}
        // router.navigate('composer/' + item.StorageID());

    }

    var options = {
        displayName : 'My Playlists',
        itemClass : ModelLib.Playlist,
        attrFilter : ModelLib.StructPlaylist,
        entityName: 'Playlists',
        dialogViews : {
            'edit':'views/dlg-edit-playlist'
        },
        // new handlers (used in view):
        addMethods : {
            'compose': compose
            // ,'canDeactivate': canDeactivate
        },
        columns : [
            // name, sortBy, sortState
            {name:'Playlist ID', sortBy:'StorageID'},
            {name:'Label'},
            {name:'Created', sortBy:'CreatedTime'},
            {name:'Comment'}
        ],
        endpoints : {
            'create':'',
            'read':'',
            'readMany':'',
            'update':'',
            'delete':''
        },
        populate : [
            {'Label':'Playlist #1', 'CreatedTime': '2016-01-01 00:00:00', 'Comment': 'My Playlist'},
            {'Label':'Playlist #2', 'CreatedTime': '2015-12-31 00:00:00', 'Comment': 'Another Playlist'},
            {'Label':'Playlist #3', 'CreatedTime': '2015-11-01 00:00:00', 'Comment': 'Sample'}
        ]
    };

    return TableViewFactory(options);


});