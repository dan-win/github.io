    define(['durandal/composition','jquery'], function(composition, $) {
    	var lastId = 1;

        function assertDefined(data, field) {
            if (typeof data[field] == 'undefined') 
                throw new Error('Widget error: required field missed: '+field);
            return data[field]; 
        }

        var ctor = function() { };
     
        ctor.prototype.activate = function(settings) {
            // required:
            // assertDefined(settings, 'value');

            // optional:
        	settings.label = settings.label || null; // allow controls without labels
        	settings.name = settings.name || 'control_'+(++lastId);
        	settings.hasIcon = !!settings.glyphicon || !!settings.texticon;
        	settings.texticon = settings.texticon || null;
        	settings.glyphicon = !settings.texticon && settings.glyphicon || '';
        	settings.placeholder = settings.placeholder || null;
        	settings.pattern = settings.pattern || null;
        	settings.bootstrapColClass = settings.bootstrapColClass || 'col-xs-12 col-sm-4';

            this.settings = settings;
        };
     
        // ctor.prototype.getHeaderText = function(item) {
        //     if (this.settings.headerProperty) {
        //         return item[this.settings.headerProperty];
        //     }
     
        //     return item.toString();
        // };
     
        ctor.prototype.afterRenderItem = function(elements, item) {
            // var parts = composition.getParts(elements);
            // var $itemContainer = $(parts.itemContainer);
     
            // $itemContainer.hide();
     
            // $(parts.headerContainer).bind('click', function() {
            //     $itemContainer.toggle('fast');
            // });
        };
     
        return ctor;
    });
