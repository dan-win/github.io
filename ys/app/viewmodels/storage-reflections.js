//storage-reflections.js
// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (ignore, modfunc) {
		MODULES.storage_reflections = modfunc(
			_, ko, IO,
			MODULES.model_asset,
			MODULES.model_timeline,
			MODULES.model_display,
			MODULES.model_channel,
			MODULES.model_device,
			MODULES.model_user,
			MODULES.model_exposition
			);
	}
}

//model-display.js

define([
	'underscore.all', 
	'knockout.all', 
	'shared/io.middleware',
	'viewmodels/model-asset',
	'viewmodels/model-timeline',
	'viewmodels/model-display',

	'viewmodels/model-channel',
	'viewmodels/model-device',
	'viewmodels/model-user',
	'viewmodels/model-exposition'], 

function(_, ko, IO, mdAsset, mdTimeline, mdDisplay, mdChannel, mdDevice, mdUser, mdExposition){

	// Common methods:
	var _toJS = function (obj) {return obj.toJS()}
	var _fromJS = function (obj, data) {
		obj.updateValues(data)
		return obj
	}
	var _makeKey = function (objItem) {
		return objItem.StorageID.peek()
	}

	var ObjectReflection = IO.ObjectReflection;
	var Asset = mdAsset.Asset;
	var Timeline = mdTimeline.Timeline;
	var Playlist = mdDisplay.Playlist;

	// Moved into methods below ()
	// var Channel = mdChannel.Channel;
	// var Device = mdDevice.Device;
	// var User = mdUser.User;

	var BasicReflection = ObjectReflection(null);

	BasicReflection.toJS(_toJS)
	BasicReflection.fromJS(_fromJS);
	BasicReflection.makeKey(_makeKey);
	BasicReflection.itemFactory(function (data) {
		return data // <--- return data "as-is" by default
	});

	// For each specific class - do no forget to assign itemFactory function!
	// Note that data is already in argument already transformed (i.e. not necessary to call "toJS" explicitly)

	var AssetReflection = ObjectReflection(null);

	AssetReflection.toJS(function (objItem) {
		// convert to the common "upload" task data
		var data = objItem.toJS() // <- IFUpdate.toJS() used
		// translate Asset.uploadFile to the common 'uploadData' attribute
		// and encode metadata
		var uploadTask = {};
		// [1] 'uploadData' (if any)
		uploadTask['uploadData'] = objItem.uploadFile.peek();
		// Note that "undefined" values will be ignored by default:)
		// [2] 'matadata' - mandatory attribute with 1 mandatory field 'contentType'
		uploadTask['metadata'] = {
			'contentType': _.popAttr(data, 'MimeType')

			,'md5Hash': _.popAttr(data, 'md5Hash') 	//string 	YES on upload, NO on updateMetadata
			,'cacheControl': _.popAttr(data, 'cacheControl') 	//string 	YES
			,'contentDisposition': _.popAttr(data, 'contentDisposition') 	//string 	YES
			,'contentEncoding': _.popAttr(data, 'contentEncoding') 	//string 	YES
			,'contentLanguage': _.popAttr(data, 'contentLanguage') 	//string 	YES
			// These fields will be ignored in FirebaseStrorage
			,'size': _.popAttr(data, 'FileSize')
			}; //<- at least: contentType
		// [3] - 'customMetadata' - all user-defined data
		uploadTask['customMetadata'] = data
		return uploadTask
	});

	AssetReflection.fromJS(function (objItem, response) {
		// decode metadata
		// note that the CDN server can return additional and changed values so update object to appropriate status!
		var _srvMd = response.metadata || {};
		console.log('=>>> response', response, '_srvMd:', _srvMd);
		// Unwrap metadata, and map known fields:
		var data = _.extend({}, _srvMd, response.customMetadata || {}, {
			'FileSize': _srvMd.size,
			'Src': _srvMd.url,
			'SrvFileName': _srvMd.fileName,
			'CreatedTime': _srvMd.created,
			'ModifiedTime': _srvMd.updated,
			'MimeType': _srvMd.contentType
			/* Field('StorageID'), 
			*  Field('CreatedTime'), 
			*  Field('ModifiedTime'): */ 
		});
		objItem.updateValues(data) // <- IFUpdate.updateValues() used
		return objItem
	});

	AssetReflection.itemFactory(function (data) {
		return new Asset(data) // <--- Redefine that before actual call - here Asset is not defined
	});

	AssetReflection.makeKey(function (objItem) {
		try {
			var
				fileName = objItem.FileName.peek(), 
				fileExt = fileName.match(/\./gi) ? fileName.split('.').pop() : objItem.MimeType.peek().split('/').pop();
			return [objItem.StorageID.peek(), fileExt].join('.')
		} catch (e) {
			console.error('AssetReflection.makeKey: ', e, 'objItem:', objItem)
			return 0
		}
	});

	var TimelineReflection = ObjectReflection(null);
	TimelineReflection.toJS(_toJS)
	TimelineReflection.fromJS(_fromJS);
	TimelineReflection.makeKey(_makeKey);
	TimelineReflection.itemFactory(function (data) {
		return new Timeline(data) // <--- return data "as-is" by default
	});

	var PlaylistReflection = ObjectReflection(null);
	PlaylistReflection.toJS(_toJS)
	PlaylistReflection.fromJS(_fromJS);
	PlaylistReflection.makeKey(_makeKey);
	PlaylistReflection.itemFactory(function (data) {
		return new Playlist(data) // <--- return data "as-is" by default
	});


	var ChannelReflection = ObjectReflection(null);
	ChannelReflection.toJS(_toJS)
	ChannelReflection.fromJS(_fromJS);
	ChannelReflection.makeKey(_makeKey);
	ChannelReflection.itemFactory(function (data) {
		return new mdChannel.Channel(data) // <--- return data "as-is" by default
	});

	var DeviceReflection = ObjectReflection(null);
	DeviceReflection.toJS(_toJS)
	DeviceReflection.fromJS(_fromJS);
	DeviceReflection.makeKey(_makeKey);
	DeviceReflection.itemFactory(function (data) {
		return new mdDevice.Device(data) // <--- return data "as-is" by default
	});

	var UserReflection = ObjectReflection(null);
	UserReflection.toJS(_toJS)
	UserReflection.fromJS(_fromJS);
	UserReflection.makeKey(_makeKey);
	UserReflection.itemFactory(function (data) {
		return new mdUser.User(data) // <--- return data "as-is" by default
	});

	var ExpositionReflection = ObjectReflection(null);
	ExpositionReflection.toJS(_toJS)
	ExpositionReflection.fromJS(_fromJS);
	ExpositionReflection.makeKey(_makeKey);
	ExpositionReflection.itemFactory(function (data) {
		return new mdExposition.Exposition(data) // <--- return data "as-is" by default
	});


	return {
		BasicReflection: BasicReflection,
		AssetReflection: AssetReflection,

		TimelineReflection: TimelineReflection,
		PlaylistReflection: PlaylistReflection,

		ChannelReflection: ChannelReflection,
		DeviceReflection: DeviceReflection,
		UserReflection: UserReflection,

		ExpositionReflection: ExpositionReflection
	}
});