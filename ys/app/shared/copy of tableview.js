define([
	'plugins/http', 
	'durandal/app', 
	'knockout', 
	'underscore.all', 
	'jquery', 
	'shared/io.middleware'], 
        function (http, app, ko, _, $, IO) {

    return function TableViewFactory (options) {
    	// body...
	    var
	        displayName = _.assertDefined(options.displayName, 
	        	'TableViewFactory: "displayName" is undefined!'),
	        itemClass = _.assertDefined(options.itemClass, 
	        	'TableViewFactory: "itemClass" is undefined!'),
	        entityName = _.assertDefined(options.entityName, 
	        	'TableViewFactory: "entityName" is undefined!'),
	        attrFilter = _.assertDefined(options.attrFilter, 
	        	'TableViewFactory: "attrFilter" is undefined!'),
	        dialogViews = _.assertDefined(options.dialogViews, 
	        	'TableViewFactory: "dialogViews" is undefined (must be at least a "{}" object)!'),
	        columns = _.assertDefined(options.columns, 
	        	'TableViewFactory: "columns" is undefined!'),
	        // alias = _.assertDefined(options.storageAlias, 
	        // 	'TableViewFactory: "storageAlias" is undefined!'),
	        endpoints = _.assertDefined(options.endpoints, 
	        	'TableViewFactory: "endpoints" is undefined!'),
	        populate = _.assertDefined(options.populate, 
	        	'TableViewFactory: "populate" is undefined (must be at least a "{}" object)!');

	    var ctor = function () {
	        var 
	        	self = this,
	        	io = IO.Gateway();

	        console.log('this: ', this);

	        self.displayName = displayName;

	        self.changed = ko.observable(false);

	        // var itemClass = itemClass;
	        // var dialogViews = dialogViews;
	        // var populate = populate;

	        self.columns = ko.observableArray(_.map(columns, function (options) {
	            return Column(options);
	        }));

	        // add methods if specified:
	        if (options.addMethods) {
	        	for (var method in options.addMethods) {
	        		self[method] = options.addMethods[method];
	        	}
	        }

	        if (options.lists) {
	        	self.lookups = options.lists;
	        }

	        self.sort = function (item) {

	            var mode = (item.sortState < 2) ? item.sortState+1 : 1,
	            crit = item.sortBy;
	            _.each(self.columns(), function (col) {col.sortState = 0; col.sortIcon('fa fa-sort')});
	            item.sortState = mode;
	            item.sortIcon(['fa fa-sort', 'fa fa-sort-down', 'fa fa-sort-up'][item.sortState]);
	            if (mode == 0) return;
	            if (mode == 1) {
	                self.items.sort(function (left, right) { 
	                    left = ko.utils.unwrapObservable(left[crit]);
	                    right = ko.utils.unwrapObservable(right[crit]);
	                    return left == right ? 0 : (left < right ? -1 : 1) });
	            } else {
	                self.items.sort(function (left, right) { 
	                    left = ko.utils.unwrapObservable(left[crit]);
	                    right = ko.utils.unwrapObservable(right[crit]);
	                    return left == right ? 0 : (left < right ? 1 : -1) });
	            }
	        };

	        self.items = ko.observableArray(_.map(populate, function (options) {
	            return new itemClass(options);
	        })).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });

	        self.markedItems = ko.observableArray([]);
	        self.markedItems.subscribe(function () {
	            var enable = self.markedItems().length > 0,
	                controls = $('.metaclass-bulk-remove');
	            if (enable) {
	                controls.removeAttr('disabled')
	            } else {
	                controls.attr('disabled', 'disabled')
	            }
	        });

	        self.mark = function (item) {
	            var index = self.markedItems.indexOf(item);
	            if (index < 0) {
	                self.markedItems.push(item);
	            } else {
	                self.markedItems.splice(index, 1);
	            }
	            console.log(ko.toJS(self.markedItems));
	            return true;
	        };

	        self.stateLegend = function () {
	            return (self.markedItems().length > 0) 
	                ? 
	                '&nbsp;You have selected <span class="badge">'+ self.markedItems().length + '</span> element(s)'
	                :
	                '';
	        }

	        self.activate = function () {
	            //the router's activator calls self function and waits for it to complete before proceeding
	            // if (self.items().length > 0) {
	            //     return;
	            // }

	            // returns promise
	            return io.signIn().then(function (result) {
					// success:
					console.log('Auth OK: ', result);
					return io.loadCollection(entityName, self.items, function (data) {
			            	return new itemClass(data);
			            }).then(function (response) {
			            	console.log(response);
			            }).catch(function (reason) {
			            	console.log(reason);
			            });
				})
				.catch(function (reason) {
					alert(reason.toString());
					console.warn('??? Auth Error: ', reason);
					return reason;
				})

	            // return http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne', 
	            //     { tags: 'mount ranier', tagmode: 'any', format: 'json' }, 'jsoncallback').then(function(response) {
	            //     self.items(response.items);
	            // });
	        };

	        self.select = function(item) {
	            //the app model allows easy display of modal dialogs by passing a view model
	            //views are usually located by convention, but you an specify it as well with viewUrl
	            item.viewUrl = 'views/detail';
	            app.showDialog(item);
	        };

	        self.add = function () {
	        	var newItem;
	            try {
	                console.log('adding');
	                newItem = new itemClass();


	                // reload collection from server:
		            io.loadCollection(entityName, self.items, function (data) {
		            	return new itemClass(data);
		            }).then(function (response) {
		            	console.log(response);
		            }).catch(function (reason) {
		            	console.log(reason);
		            });
		            // insert item
	                self.items.push(newItem);
	                // save entire collection:
	                io.saveCollection(entityName, self.items).then(function (response) {
		            	console.log(response);
		            }).catch(function (reason) {
		            	console.log(reason);
		            });
	                console.log('added');
	            } catch (e) {console.error(e)}
	        };

	        // var wrapSetter = function (item) {
	        // 	return function () {
	        // 		// body...
		       //  	var buffer;
	        //         // reload collection from server (if somebody changes another item(s)):
		       //      io.loadCollection(entityName, self.items, itemClass);
		       //      buffer = self.items.peek();
		       //      // replace new version of item:
		       //      _.each(buffer, function (_item, index ) {
		       //      	if (_item.StorageID() == item.StorageID()) {
		       //      		buffer[index] = item;
		       //      	}
		       //      io.saveCollection(entityName, buffer);
		       //      })

		       //  	// // post changes to server
	        //   //       // Item must implement IFUpdate interface (item.toJS()):
		       //  	// io.save(entityName, item.StorageID(), item());
	        // 	}
	        // }

	        self.edit = function (item) {
	        	var currentItem = item;
	            app.customDialog({
	            	'buffer': item, 
	            	'attrFilter': attrFilter, 
	            	'viewUrl': _.assertDefined(dialogViews['edit'], 
	            		'TableViewFactory: required view "edit" is undefined in "options.dialogViews"!'),
	            	'lookups': self.lookups
	            }).waitConfirm(function () {
	            	// update entire collection
		        	var buffer;
	                // reload collection from server (if somebody changes another item(s)):
		            io.loadCollection(entityName, self.items, function (data) {
		            	return new itemClass(data);
		            }).then(function (response) {
		            	console.log(response);
		            }).catch(function (reason) {
		            	console.log(reason);
		            });
		            buffer = self.items.peek();
		            // replace new version of item:
		            _.each(buffer, function (_item, index ) {
		            	if (_item.StorageID() == currentItem.StorageID()) {
		            		buffer[index] = currentItem;
		            	}
		            });
		            io.saveCollection(entityName, buffer)
		            .then(function (response) {
		            	console.log(response);
		            }).catch(function (reason) {
		            	console.log(reason);
		            });
	            }); // <--- make unpdate on server here
	        };

	        self.remove = function (item) {
	            // body...
	            var index = self.items.indexOf(item);
	            if (index < 0) return;
	            console.log(ko.toJS(item));
	            // ask confirm:
	            app.showMessage(
	                'Are you sure you want to remove element \"'+ item.Label() + '\"?', 
	                'Confirm', ['Yes', 'No']
	            ).then(function (result) {
	                if (result == 'Yes') {
	                	self.items.splice(index, 1);
	                	// to-do: same as for "edit" - re-read collection before save (above)
	                	// Save entire collection:
	                	io.saveCollection(entityName, self.items).then(function (response) {
			            	console.log(response);
			            }).catch(function (reason) {
			            	console.log(reason);
			            });
	                }
	            });
	        };

	        self.removeMany = function (item) {
	            // body...
	            var 
	                _selection = self.markedItems.peek();
	            if (!_selection.length) return;
	            // ask confirm:
	            app.showMessage(
	                'Are you sure you want to remove '+ _selection.length + ' element(s)?', 
	                'Confirm', ['Yes', 'No']
	            ).then(function (result) {
	                if (result != 'Yes') return;
	                // remove elements:
	                _.each(_selection, function (item) {
	                    var index = self.items.indexOf(item);
	                    if (index > -1) {
	                    	self.items.splice(index, 1);
	                    }
	                });
                	// Save entire collection:
                	io.saveCollection(entityName, self.items)
                	.then(function (response) {
		            	console.log(response);
		            }).catch(function (reason) {
		            	console.log(reason);
		            });;
	                // clear selection:
	                self.markedItems([]);
	            });        
	        };

	        self.details = function (item) {
	            // body...
	        };
	        // self.canDeactivate = function () {
	        //     //the router's activator calls self function to see if it can leave the screen
	        //     return app.showMessage('Are you sure you want to leave self page?', 'Navigate', ['Yes', 'No']);
	        // };
	    };

	    // Helper function to create column metadata:
	    function Column (options) {
	        return {
	            Name: options.name || '',
	            sortBy: options.sortBy || options.name,
	            sortState: options.sortState || 0,
	            sortIcon : ko.observable('fa fa-sort')
	        };
	    };

	    return ctor;

    }

});