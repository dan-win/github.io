define([
    'plugins/http', 
    'durandal/app', 
    'knockout', 
    'viewmodels/model-asset', 
    'shared/tableview',
    // connect fileupload plugins:
    'jquery',
    // 'jquery-fileupload/vendor/jquery.ui.widget',
    'jquery-fileupload/jquery.iframe-transport',
    'jquery-fileupload/jquery.fileupload'
    ], 
function (http, app, ko, ModelLib, TableViewFactory, $) {
    'use strict';

    //Note: This module exports an object.
    //That means that every module that 'requires' it will get the same object instance.
    //If you wish to be able to create multiple instances, instead export a function.
    //See the 'welcome' module for an example of function export.

    console.log('DUMP->', ko.toJSON(new ModelLib.Asset()));

    var options = {

        'displayName' : 'My Assets',
        'itemClass' : ModelLib.Asset,
        'entityName' : 'Assets', // <-- data partition on the server
        'attrFilter' : ModelLib.StructAsset,
        'dialogViews' : {'edit':'views/dlg-edit-asset'},
        'columns' : [
            // name, sortBy, sortState

            {'name':'Asset ID', sortBy:'StorageID'},
            {'name':'Label'},
            {'name':'Created', sortBy:'CreatedTime'},
            {'name':'Modified', sortBy:'ModifiedTime'},
            {'name':'Filename'},
            {'name':'Size', sortBy:'FileSize'},
            {'name':'Media type', sortBy:'MediaType'},
            {'name':'MIME type', sortBy:'MimeType'},
            {'name':'Used', sortBy:'LockCount'},
            {'name':'Comment'}

        ],
        'endpoints' : {
            'create':'',
            'read':'',
            'readMany':'',
            'update':'',
            'delete':''
        },
        'populate' : [
            {'Label':'Asset #1', 'CreatedTime': '2016-01-01 00:00:00', 'Comment': '-'},
            {'Label':'Asset #2', 'CreatedTime': '2015-12-31 00:00:00', 'Comment': '-'},
            {'Label':'Asset #3', 'CreatedTime': '2015-11-01 00:00:00', 'Comment': '-'}
        ]
    };

    // subscribe to show event for dialogs to init fileupload:
    app.on('customDialog:show').then(function (arg) {

        var jEl = $('.file-upload');

        console.log('DIALOG', arg);

        if (arg['view'] == options.dialogViews['edit'] && !jEl.hasClass('mc-fileupload-plugin')) {

            jEl.fileupload({
                'url': '/upload',
                'dataType': 'json',
                'dropZone': $('.fileupload-dropzone'), 
                'done': function (e, data) {
                    var message = '';
                    // $.each(data.result.files, function (index, file) {
                    //     message += file.name;
                    // });
                    console.log('Files uploaded: ', e, data);
                    console.log('Files:', data.files[0].name);
                    arg.model.Filename(data.files[0].name);
                    arg.model.SrvFilename(data.files[0].name);
                }
            }).addClass('mc-fileupload-plugin'); // <- mark as initialized

            console.log('handler fileupload - installed: ',jEl.length);
        }
    });

    app.on('customDialog:Ok').then(function (arg) {
        // fill defaults if necessary:
        var model = arg.model;
        if (arg['view'] == options.dialogViews['edit']){
            if (model.Label=="Noname") model.Label(model.Filename()); 
        }
    })

    // disable default drag/drop here...
    // $(document).bind('drop dragover', function (e) {
    //     e.preventDefault();
    // });    

    return TableViewFactory(options);



});


/*
'_rid':'Asset_3',

'StorageID':'4',
'Label':'Noname',
'CreatedTime':'2016-02-25 13:52:12',
'ModifiedTime':'2016-02-25 13:52:12',
'Filename':'dummy.png',
'Src':'/api/media/dummy.jpg',
'MimeType':'image/jpeg',
'LockCount':0,

'Type':'<undefined>','XRes':0,'YRes':0,'Size':0,

'_rtti':'class:Asset','GlyphSrc':'/media/dummy.png'

*/