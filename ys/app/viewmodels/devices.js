define(['plugins/http', 'durandal/app', 'knockout', 'underscore', 'viewmodels/model-device', 'shared/tableview'], 
		function (http, app, ko, _, ModelLib, TableViewFactory) {
    //Note: This module exports an object.
    //That means that every module that "requires" it will get the same object instance.
    //If you wish to be able to create multiple instances, instead export a function.
    //See the "welcome" module for an example of function export.

    var options = {

        displayName : 'My Devices',
        itemClass : ModelLib.Device,
        attrFilter : ModelLib.StructDevice,
        entityName: 'Devices',
        dialogViews : {'edit':'views/dlg-edit-device'},
        columns : [
            // name, sortBy, sortState
            {name:'Device ID', sortBy:'StorageID'},
            {name:'Label'},
            {name: 'Resolution'},
            {name: 'Browser'},
            {name: 'Address'},
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
            {'Label':'Device #1', 'Address':'Moscow', 'CreatedTime': '2016-01-01 00:00:00', 'Comment': 'For children'},
            {'Label':'Device #2', 'Address':'Moscow', 'CreatedTime': '2015-12-31 00:00:00', 'Comment': 'Business device'},
            {'Label':'Device #3', 'Address':'Moscow', 'CreatedTime': '2015-11-01 00:00:00', 'Comment': 'Retail'}
        ],
        lists : {
            ScreenTypes : [
                'unknown',
                '800x600, 4:3 (SVGA)',
                '1024x768, 4:3 (XGA)',
                '1152x864, 4:3 (XGA+)',
                '1280x720, 16:9 (WXGA)',
                '1280x768, 5:3 (WXGA)',
                '1280x800, 16:10 (WXGA)',
                '1280x1024, 5:4 (SXGA)',
                '1440x900, 16:10 (WXGA+)',
                '1600x900, 16:9 (HD+)',
                '1600x1200, 4:3 (UXGA)',
                '1680x1050, 16:10 (WSXGA+)',
                '1920x1080, 16:9 (FHD)',
                '1920x1200, 16:10 (WUXGA)',
                '2560x1440, 16:9 (QHD)',
                '2560x1600, 16:10 (WQXGA)',
                '3840x2160, 16:9 (4K UHD)'           
            ],
            Browsers: [
                'unknown',
                'Chomium',
                'Firefox',
                'Opera',
                'embedded'
            ]
        }
    };

    return TableViewFactory(options);

});