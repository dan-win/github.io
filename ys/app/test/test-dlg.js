//test-dlg.js
define(['plugins/http', 'durandal/app', 'knockout', 'underscore', 'jquery', 'shared/tableview'], 
        function (http, app, ko, _, $, TableViewFactory) {
    //Note: This module exports an object.
    //That means that every module that "requires" it will get the same object instance.
    //If you wish to be able to create multiple instances, instead export a function.
    //See the "welcome" module for an example of function export.

    function StructTest (scope, data) {
    	// body...
    	scope = scope || {};
    	data = data || {};
    	scope.Label = ko.observable(ko.utils.unwrapObservable(data.Label) || 'Name');
    	scope.Comment = ko.observable(ko.utils.unwrapObservable(data.Comment) || '');
    	scope.Note = ko.observable(ko.utils.unwrapObservable(data.Note) || 'Note');
    	return scope;
    }

    function TestObj (data) {
    	StructTest(this, data);
    }

    var options = {
        displayName : 'My Test',
        itemClass : TestObj,
        attrFilter : StructTest,
        dialogViews : {
            'edit':'test/dlg-edit'
        },
        columns : [
            // name, sortBy, sortState
            {name:'Label'},
            {name:'Comment'},
            {name:'Note'}
        ],
        endpoints : {
            'create':'',
            'read':'',
            'readMany':'',
            'update':'',
            'delete':''
        },
        populate : [
            {'Label':'Test #1', 'Timestamp': '2016-01-01 00:00:00', 'Comment': 'My Test'},
            {'Label':'Test #2', 'Timestamp': '2015-12-31 00:00:00', 'Comment': 'Another Test'},
            {'Label':'Test #3', 'Timestamp': '2015-11-01 00:00:00', 'Comment': 'Sample'}
        ]
    };


    return TableViewFactory(options);

});