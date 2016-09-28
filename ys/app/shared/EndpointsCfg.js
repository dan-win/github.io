// EdpointsCfg.js
// Entity->verb->{method, url}
/*

// init transport
var http = IO.HttpTransportFactory(_root);

// init endpoints
var enumGroupsEP = IO.EndpointBindingFactory('sprinklerGroups/GetSprinklerGroupsSummary/006381')
	.method('GET')
	.json(true);

// adresses of the service endpoints under the root:
var postProgramEP = IO.EndpointBindingFactory('Programs/PostProgram')
	.method('POST')
	.json(true);

// adresses of the service endpoints under the root:
var getProgramEP = IO.EndpointBindingFactory('Programs/GetFullProgram/:programId')
	.method('GET')
	.json(true);


*/
// 'enum', 'save', 'saveas', 'load', 'remove'

// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.endpointscfg = modfunc(
			_,  
			IO
			);
	}
}

define([
	'underscore.all', 
	'shared/io' 
], 

function (_, IO) {
	var ep = {};

	function EP(entity, verb, url, method) {
		// if (!ep[entity]) ep[entity] = {};
		// ep[entity][verb] = IO.endpoint(url).method(method).json(true);
	}

	// Endpoints:

	// ////////////////////////////////////
	// Asset
	// ////////////////////////////////////

	EP('Assets', 'loadCollection', 'assets', 'GET'); // list
	EP('Assets', 'saveCollection', 'assets', 'POST'); // list

	EP('Assets', 'load', 'assets/:key', 'GET'); // load specified item

	EP('Assets', 'saveas', 'assets/:key', 'PUT'); // create new item
	EP('Assets', 'save', 'assets/:key', 'POST'); // update item
	EP('Assets', 'remove', 'assets/:key', 'DELETE'); // delete item


	// ////////////////////////////////////
	// Channel
	// ////////////////////////////////////
	
	EP('Channels', 'loadCollection', 'channels', 'GET'); // list
	EP('Channels', 'saveCollection', 'channels', 'POST'); // list

	EP('Channels', 'load', 'channels/:key', 'GET'); // load specified item

	EP('Channels', 'saveas', 'channels/:key', 'PUT'); // create new item
	EP('Channels', 'save', 'channels/:key', 'POST'); // update item
	EP('Channels', 'remove', 'channels/:key', 'DELETE'); // delete item


	// ////////////////////////////////////
	// Playlist
	// ////////////////////////////////////
	
	EP('Playlists', 'loadCollection', 'playlists', 'GET'); // list
	EP('Playlists', 'saveCollection', 'playlists', 'POST'); // list

	EP('Playlists', 'load', 'playlists/:key', 'GET'); // load specified item

	EP('Playlists', 'saveas', 'playlists/:key', 'PUT'); // create new item
	EP('Playlists', 'save', 'playlists/:key', 'POST'); // update item
	EP('Playlists', 'remove', 'playlists/:key', 'DELETE'); // delete item

	// ////////////////////////////////////
	// Device
	// ////////////////////////////////////
	
	EP('Devices', 'loadCollection', 'devices', 'GET'); // list
	EP('Devices', 'saveCollection', 'devices', 'POST'); // list

	EP('Devices', 'load', 'devices/:key', 'GET'); // load specified item

	EP('Devices', 'saveas', 'devices/:key', 'PUT'); // create new item
	EP('Devices', 'save', 'devices/:key', 'POST'); // update item
	EP('Devices', 'remove', 'devices/:key', 'DELETE'); // delete item


	// return list of endpoints:
	
	return ep;

});