(function (root, factory) {

    if (typeof define === "function" && define.amd) { // AMD mode
        define(["knockout", "jquery"], factory);
    } else if (typeof exports === "object") { // CommonJS mode
        factory(require("knockout"), require("jquery"));
    } else {
        // this module does not export anything into "window" namespace:
        factory(root.ko, root.$); // Plain JS
    }

}(this, function (ko, $) {

    var autoId = 0;

    ko.components.register('bootstrap-form-group', {
        viewModel: {
            createViewModel: function(params, componentInfo) {

                // - 'params' is an object whose key/value pairs are the parameters
                //   passed from the component binding or custom element
                // - 'componentInfo.element' is the element the component is being
                //   injected into. When createViewModel is called, the template has
                //   already been injected into this element, but isn't yet bound.
                // - 'componentInfo.templateNodes' is an array containing any DOM
                //   nodes that have been supplied to the component. See below.
     
                // Return the desired view model instance, e.g.:
                // return new MyViewModel(params);

                function toJq(list) {
                    // convert text nodes into spans
                    var collection = [];
                    $.each(list, function (index, item) {
                        var child, text;
                        if (item.nodeType == 3) {
                            text = item.nodeValue.replace(/\s/g, '');
                            if (text.length > 0) {
                                item = document.createElement('span');
                                item.innerHTML = text;
                            } else return;
                        }
                        collection.push(item);
                    });
                    collection = jQuery(collection);
                    return collection
                }
                var
                    $wrapper = $(componentInfo.element),
                    $collection = toJq(componentInfo.templateNodes),
                    $control = $collection.filter('input,select,checkbox'),
                    $label = $collection.filter('label'),
                    ctrlId = ($control.attr('name')) || ($control.attr('id')) || ('ctrl_'+ ++autoId );

                params = params || {};


                // if (params.feedback) 
                //     $wrapper.append('<span class="glyphicon form-control-feedback" aria-hidden="true"></span>');

                // set up attributes
                $label
                    .attr('for', ctrlId)
                    .addClass('form-label');
                $control
                    .addClass('form-control')
                    .attr('name', ctrlId)
                    .attr('id', ctrlId);

                // console.log('elements', $collection, 'LABEL>>>', $label, 'CONTROL>>>', $control);

                // console.log('$wrapper', $wrapper);

                if (params.glyphicon) 
                    $control = 
                        $('<div/>')
                            .addClass('input-group')
                            .append(
                                $('<span/>')
                                    .addClass('input-group-addon left')
                                    .append(
                                            $('<i/>')
                                                .addClass('glyphicon')
                                                .addClass(params.glyphicon))
                                )
                        .append($control);

                if (params.feedback) {
                    $('<span/>')
                        .addClass('glyphicon form-control-feedback')
                        .attr('aria-hidden', true)
                        .insertAfter( 
                            (params.glyphicon) ? $control.find('.input-group'): $control);

                    $wrapper.find('div.form-group').addClass('has-feedback');
                }

                setTimeout(function () {
                    var item;

                    // unwrap the 'control' placeholder in template:
                    item = $wrapper.find('*[data-bind*="control"]')
                    // console.log('item found', item);
                    item.replaceWith(item.contents()); 
                    // if (params.model)
                    //     ko.applyBindings(params.model, item[0]);

                    // unwrap the 'label' placeholder in template:
                    item = $wrapper.find('*[data-bind*="label"]')
                    // console.log('item found', item);
                    item.replaceWith(item.contents());   
                    // if (params.model)
                    //     ko.applyBindings(params.model, item[0]);

                    // unwrap 'bootstrap-form-group':
                    $wrapper.replaceWith($wrapper.contents()); 


                }, 0);
                

                console.log(params.model);

                return  {
                    label: $('<div/>').append($label).html(),
                    control: $('<div/>').append($control).html()
                };


                // return $.extend(params.model || {}, 
                // {
                //     label: $('<div/>').append($label).html(),
                //     control: $('<div/>').append($control).html(),
                //     model: params.model
                // });
            }
        },
        // use inline <template> with predefined name "template-bootstrap-form-group" 
        template: {element: 'template-bootstrap-form-group'}
    });

    




}));