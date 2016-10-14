define([
    'durandal/app', 
    'knockout.all', 
    'viewmodels/model-channel', 
    'shared/tableview'], 
		function (app, ko, ModelLib, TableViewFactory) {
    //Note: This module exports an object.
    //That means that every module that "requires" it will get the same object instance.
    //If you wish to be able to create multiple instances, instead export a function.
    //See the "welcome" module for an example of function export.

    var options = {

        displayName : 'My Channels',
        itemClass : ModelLib.Channel,
        entityName : 'Channels', // <-- data partition on the server
        attrFilter : ModelLib.StructChannel,
        dialogViews : {'edit':'views/dlg-edit-channel'},
        columns : [
            // name, sortBy, sortState
            {name:'Channel ID', sortBy:'StorageID'},
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
            {'Label':'Channel #1', 'CreatedTime': '2016-01-01 00:00:00', 'Comment': 'For children'},
            {'Label':'Channel #2', 'CreatedTime': '2015-12-31 00:00:00', 'Comment': 'Business channel'},
            {'Label':'Channel #3', 'CreatedTime': '2015-11-01 00:00:00', 'Comment': 'Retail'}
        ]
    };

    return TableViewFactory(options);

});