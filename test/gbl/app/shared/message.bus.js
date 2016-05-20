//message.bus.js
// Danwin
define(['jquery'], function ($) {
	'use strict';


	// Uses wrapper around jQuery.Callbacks()
	// more on them: http://api.jquery.com/jQuery.Callbacks/

	// Idea for implementation: http://addyosmani.com/resources/essentialjsdesignpatterns/book/

	/*

	Supported Flags are the same as for jQuery.Callbacks():

	The flags argument is an optional argument to $.Callbacks(), structured as a list of space-separated strings that change how the callback list behaves (eg. $.Callbacks( "unique stopOnFalse" )).
	Possible flags:

	    once: Ensures the callback list can only be fired once (like a Deferred).
	    memory: Keeps track of previous values and will call any callback added after the list has been fired right away with the latest "memorized" values (like a Deferred).
	    unique: Ensures a callback can only be added once (so there are no duplicates in the list).
	    stopOnFalse: Interrupts callings when a callback returns false.

	By default a callback list will act like an event callback list and can be "fired" multiple times.	

	Example:
	$.ntfbus('my-message').subscribe(myhandler);
	$.ntfbus('my-message').publish({data:1, ...}});

	*/

	var topics = {};
	 
	return function( id, flags ) {
	    var callbacks,
	        topic = id && topics[ id ];
	        flags = flags || '';
	    if ( !topic ) {
	        callbacks = $.Callbacks(flags);
	        topic = {
	            'tell': callbacks.fire,
	            'listen': callbacks.add,

	            'publish': callbacks.fire,
	            'subscribe': callbacks.add,

	            'unsubscribe': callbacks.remove
	        };
	        if ( id ) {
	            topics[ id ] = topic;
	        }
	    }
	    return topic;
	};
});