// // ------------------> UMD!

/*
To-do:
1. Exceptions in all methods which return promises: rewrite "throw" to "reject"
2. Create base class FirebaseDataService and move all common methods of FirebaseStorage and FirebaseDB to it (FirebaseDB is not descendant of FirebaseStorage!).
3. metadata - move "main" attributes directly in "data" namespace
4. MEDIATED attributes for Storage/CDN data: 
* rscLink
* size
* contentType
* customMetadata
* file --> becomes BLOB (?)
 */
// // Extends IO singleton with a new transport factory for a local storage

// define(['shared/io', 'firebase'], function(IO) { // <-- note that "firebase" variable is global

(function(root, factory) {
	// var _modname = 'IO';
	if (typeof define === "function" && define.amd) { // AMD mode
		define(["underscore", "shared/io", "firebase"], factory);
	} else if (typeof exports === "object") { // CommonJS mode
		var _ = (typeof window._ === 'undefined') ? require("underscore") : window._;
		var IO = (typeof window.IO === 'undefined') ? require("IO") : window.IO;
		var firebase = (typeof window.firebase === 'undefined') ? require("firebase") : window.firebase;
		module.exports = factory(_, IO, firebase);
	} else {
	// This module extends "IO" (which already exists as a global variable)
		factory(root._, root.IO, root.firebase); // Plain JS, "rtl" is in window scope
		// root[_modname] = factory(root._, root.IO, root.firebase); // Plain JS, "rtl" is in window scope
	}
}(this, function(_, IO, firebase) {

	var 
		mandatory = _.assertDefined,
		isFunction = _.isFunction,
		isNull = _.isNull,
		isUndefined = _.isUndefined,
		assertType = _.assertType,
		assertDefined = _.assertDefined,
		assertTrue = _.assertTrue,
		ownKeys = _.keys,
		Exception = _.Exception,
		createExceptionClass = _.createExceptionClass,
		raise = _.raise,
		
		deepClone = _.deepClone,
		deepExtend = _.deepExtend,
		replaceDefinedProps = _.replaceDefinedProps,
		popAttr = _.popAttr;

	// note that amplify creates global variable, working through shim

	console.log('IO.FIREBASE - ENTERING', firebase);
	if (!firebase) {
		firebase = window.firebase;
		console.log('GLOBAL FIREBASE: ', firebase);
	}

	// Function injects a new factory into IO namespace and returns new extended singleton
	var Transport = IO.Transport;

	// Promise "polyfill"
	if (typeof Promise === 'undefined') {
		Promise = firebase.Promise;
	}

	var
		FirebaseError = createExceptionClass('IO.FirebaseError', IO.BaseError),
		FirebaseAuthError = createExceptionClass('IO.FirebaseAuthError', IO.AuthError),
		FirebaseStorageError = createExceptionClass('IO.FirebaseStorageError', IO.FirebaseError),
		FirebaseDBError = createExceptionClass('IO.FirebaseDBError', IO.FirebaseError);

	if (!window.firebase || !(firebase.app instanceof Function)) {
		throw new FirebaseError('You have not configured and imported the Firebase SDK. ' +
			'Make sure you go through the codelab setup instructions.');
	}

	// File source: File API, from <input type="file", intercept "change" event for this element:
	// e.g.:  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));
	//
	// and inside handler extract file object:
	//
	// FriendlyChat.prototype.saveImageMessage = function(event) {
	//   var file = event.target.files[0];
	// ...

	// registry of active apps in the form apiKey -> {config: <same as firebase config object>, appInstance: <result from firebase.initializeApp>}
	var activeApps = {};

	/**
	 * Initialize firebase appInstance or select active (by apiKey)
	 * @method initFirebaseApp
	 * @param  {object} config Application config for firebase
	 * @param {string} appName Optional name for application (if you want to create a separate instance of Firebase app)
	 * @return {firebase app}        Instance of firebase application
	 */
	function initFirebaseApp(config, appName) {
		var
			apiKey = assertDefined(config.apiKey, 
				'Firebase IO error: no apiKey in config!'),
			running = activeApps[appName || apiKey],
			appInstance;

		if (typeof running === 'undefined') {
			appInstance = firebase.initializeApp(config, appName);
			activeApps[appName || apiKey] = {
				'config': deepClone(config),
				'appInstance': appInstance
			};
		} else {
			appInstance = running.appInstance;
		}
		return appInstance;
	}

	// gs:// - official scheme name for Firebase Storage:
	Transport.registry.uriScheme['gs'] = FirebaseStorage;
	/**
	 * Interface for Firebase Storage Service. Usage - for "heavy" content like images, videos, etc.
	 * @constructor
	 * @this {FirebaseStorage}
	 * @param  {object}        options     [description]
	 * @param  {string}        mapLocation [description]
	 */
	function FirebaseStorage(url, options) {

		// To-do
		// config - config for alias or a whole config?
		// Enum assets?
		// snapshot.downloadUri? read->metdata?

		var
			_url = url.match(/\:/g) ? url.split(':').pop() : url,
			self = IO.Transport(_url.replace(/^\/+/g, ''), options);

		console.log('Create FirebaseStorage Instance...');

		// Firebase initialization:
		self.init = function(fbConfig, appName) {
			self._fbConfig = assertDefined(fbConfig, 
				'Firebase config attribute is missed in the transport.init(fbConfig) call!');
			assertDefined(fbConfig.storageBucket, 
				'Firebase Storage requires "storageBucket" attribute in fbConfig!');
			self._firebase = initFirebaseApp(fbConfig, appName);

			self._auth = self._firebase.auth();
			// Initiates Firebase auth and listen to auth state changes.
			// self._auth.onAuthStateChanged(function (user) {
			// 	self._user = user;
			// });

			self._svcHandle = self._firebase.storage();
			return self;
		};

		self._tname = 'FirebaseStorage';

		self._defErrorClass = FirebaseStorageError;

		// Override the inherited method (any arguments for URN are mapped in "/path/:arg/..." form, not in http-like "...?arg=value&...")		


		self._resolveUri = function (urn, qryArgs, rqOptions) {
			var 
				_location = self.url().replace(/[\/]+$/g, ''),
				_urn = urn.replace(/^[\/]+/g, '');
			// Ignore qryArgs here:
			// if (qryArgs) {
			// 	_urn = [_urn, '?', serializeUriVariables(qryArgs)].join('')
			// }
			console.log('_path-->', _urn);
			return self._escapePath((_location.length > 0) ? [_location,_urn].join('/') : _urn);
		};

		// To-do: Use qryArgs to resolve URI in the same way as pathArgs ????
		// (Idea only)
		// self._resolveUri = function(urn, qryArgs, rqOptions) {
		// 	var
		// 		_location = urn.replace(/[\/]+$/g, ''),
		// 		_urn = urn.replace(/^[\/]+/g, ''),
		// 		// to-do: borrowed from "endpoint" factory, refactor that:
		// 		_pathNodes = _urn.split('/'),
		// 		_argsMap = [],

		// 		pathBuffer = _pathNodes.slice(0), // <-- local copy of entire array
		// 		argsToProcess = deepClone(qryArgs || {}),
		// 		unknownArgs;

		// 	// to-do: borrowed from "endpoint" factory, refactor that:
		// 	// Parse argument placeholders in URN:
		// 	_.each(_pathNodes, function(name, indexInPath) {
		// 		if (':' == name.charAt(0)) { // argument found
		// 			name = name.substring(1); // remove leading ":" :
		// 			_argsMap.push([indexInPath, name]); // add to map "name -> index in tags"
		// 		}
		// 	});

		// 	assertType(qryArgs, 'object', ' "qryArgs" must be an object !');

		// 	_.each(_argsMap, function(pair) {
		// 		var 
		// 			indexInPath = pair[0],
		// 			name = pair[1],
		// 			value = popAttr(argsToProcess, name);
		// 		if (typeof value === 'undefined')
		// 			throw new IO.ArgumentError('Required argument \"' + name + '\" missed!');
		// 		// replace placeholder by actual value:
		// 		pathBuffer[indexInPath] = value;
		// 	});

		// 	if (_.size(argsToProcess) > 0) {
		// 		throw new IO.ArgumentError('Arguments \"' + unknownArgs.join(',') + '\" now allowed for: ' + urn);
		// 	}

		// 	_urn = pathBuffer.join('/');

		// 	console.log('_path-->', _urn);

		// 	// always use a relative path for Firebase:
		// 	return _urn;
		// };


		/**
		 * Overriden: Low-level method (invockable from _dispatchRequest)
		 * @method
		 * @param  {string} method    Name of the request method (depends on the transport protocol)
		 * @param  {string} uri       Resolved URI to request
		 * @param  {object} rqOptions Options (optional) - redefines default settings for transport
		 * @return {Promise}           Promise object
		 */
		self._request = function(method, uri, rqOptions) {
			var _error;
			try {
				// Check authentication
				if (!self._auth.currentUser) // Emulate HTTP 401: "Unathorized": 
					throw new FirebaseAuthError('Firebase requires authentication!', {code: 401});
				
				assertDefined(self._svcHandle,
					'Cannot perform Firebase request before transport.init(fbConfig) call!');
				console.log('&&&&&&& requesting as: ', self._tname);
				return self[method](uri, rqOptions)
					.catch(function(error) {
						// Transform Firebase error object to native IO.Error and return a new rejected pomise!:
						return Promise
							.reject(new self._defErrorClass(error.serverResponse, { 'code': error.code }));
					});
			} catch(e) {
				if (e instanceof IO.BaseError)
					_error = e;
				else
					_error = new self._defErrorClass(e.toString(), { 'code': 400 });
				return Promise.reject(_error);
			}
		}

		// Firebase Storage:  Metadata with read-write access:
		var fbWritableMetadata = {
			 'cacheControl': null
			,'contentDisposition': null
			,'contentEncoding': null
			,'contentLanguage': null
			,'contentType': null
			,'customMetadata': null
		};

		// Firebase Storage:  Metadata with write access on Upload:
		var fbInitialMetadata = deepExtend({
			'md5Hash': null
		}, fbWritableMetadata);

		var decodeMetadata = function (m) {
			// to-do: refactor: this object is similar to the same in the "create" method above
			// return {
			// 	// 'StorageID': s.fullPath,
			// 	'srvFileName': m.name //r
			// 	,'srvFullPath': m.fullPath //r
			// 	,'resourceUri': self._svcHandle.ref(m.fullPath).toString()
			// 	,'size': m.size
			// 	// to-do: convert timestamp: string to JS.Date()
			// 	,'created': m.timeCreated
			// 	,'modified': m.updated
			// 	,'contentType': m.contentType
			// 	,'contentLanguage': m.contentLanguage
			// 	,'cacheControl': m.cacheControl
			// 	,'customMetadata': m.customMetadata
			// 	// ,'_firebase': deepClone(m)
			// }
			return {
				// read-write:
				 'contentType': m.contentType
				,'contentLanguage': m.contentLanguage
				,'cacheControl': m.cacheControl
				,'customMetadata': m.customMetadata // {clientFileName, }

				// read-only:
				,'fileName': m.name
				,'url': m.downloadURLs[0] // metadata.downloadURLs[0]
				,'size': m.size
				,'created': m.timeCreated
				,'updated': m.updated
				,'md5Hash': m.md5Hash
			}
		}

		var encodeMetadata = function (m, updating) {
			return {
				'md5Hash': updating ? void(0) : m.md5Hash
				,'cacheControl': m.cacheControl
				,'contentDisposition': m.contentDisposition
				,'contentEncoding': m.contentEncoding
				,'contentLanguage': m.contentLanguage
				,'contentType': m.contentType
				,'customMetadata': m.customMetadata || {}
			}
		}

		/**
		 * Create or update resource
		 * @method _doCreate
		 * @param  {string} uri   [description]
		 * @param  {object} metadata   [description]
		 * @param  {function} onDone     [description]
		 * @param  {function} onError    [description]
		 * @param  {function} onProgress [description]
		 * @return {firebase.UploadTask}            Interface as firebase.Promise
		 */
		self._doCreate = function(uri, rqOptions) {
			// returns UploadTask which has methods like Promise: then, catch.
			// additional method: Cancel
			// chain result with: .then(function(){}).catch(function(error){})
			// More: https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask


			var
				o = assertDefined(rqOptions,
					'FirebaseStorage.create() requires "rqOptions" argument!'),
				data = assertDefined(o.data,
					'FirebaseStorage.create() requires "rqOptions.data" attribute!'),
				file = assertDefined(data.uploadData, 
					'FirebaseStorage.create() requires "rqOptions.data.uploadData" attribute!'),
				onProgress = o.onProgress,
				metadata =  encodeMetadata(data, true),
				fname,
				method,
				uploadTask;


			// var
			// 	o = assertDefined(rqOptions,
			// 		'FirebaseStorage.create() requires "rqOptions" argument!'),
			// 	data = assertDefined(o.data,
			// 		'FirebaseStorage.create() requires "rqOptions.data" attribute!'),
			// 	file = assertDefined(data.uploadData, 
			// 		'FirebaseStorage.create() requires "rqOptions.data.uploadData" attribute!'),
			// 	onProgress = o.onProgress,
			// 	metadata =  encodeMetadata(data, true),
			// 	fname,
			// 	method,
			// 	uploadTask;

			console.log('passed rqOptions: ', o);
			console.log('file is File -->', file instanceof File);

			var decodeResponse = function (snapshot) {
					// To-do: snapshot->response conversion would be moved into scheme-specific handler of endpoint???
					return decodeMetadata (snapshot.metadata);
				}

			var progressCallback = function (snapshot) {
					onProgress(snapshot.bytesTransferred, snapshot.totalBytes);
				}

			// Reference about different options of the data type:
			// https://firebase.google.com/docs/storage/web/upload-files#upload_files
			
			if (typeof file === 'string'){
				if (typeof metadata.contentType === 'undefined' || ['base64','base64url'].indexOf(metadata.contentType) > -1) {
					method = 'putString';
				} else {
					throw new FirebaseStorageError('For upload with type "string" contentType attribute must be "base64", "base64url" or undefined!', {code: '400'})
				}
			} else if (file instanceof File || file instanceof Blob || file instanceof Uint8Array) {
				method = 'put';
				if (file instanceof File)
					metadata['contentType'] = file.type; // {'contentType': file.type}
			} else {
				console.warn('Data type: ', typeof file, file, file instanceof File);
				throw new FirebaseStorageError('Upload object must be one of following types: string, File, Blob, Uint8Array!', {code: 400});
			}

			if (typeof metadata.contentType === 'undefined') 
				throw new FirebaseStorageError('"contentType" in metadata must be specified explicitly!', {code: 400});

			// var uploadTask = self.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
			//     .put(file, {'contentType': file.type});

			// validate "safe" name:
			fname = uri.split('/').pop();
			if (!fname.match(/[a-z0-9\.\-\_]/gi)) 
				throw new FirebaseStorageError('Filename is not safe and contains prohibited characters: '+fname, {code: 400});

			if (method === 'putString') {
				uploadTask = self._svcHandle.ref(uri).putString(file, metadata.contentType, metadata);
			} else {
				uploadTask = self._svcHandle.ref(uri).put(file, metadata);
			}

			// .on(event, nextOrObserver, error, complete):
			if (!!onProgress) uploadTask.on('state_changed', progressCallback);

			return uploadTask.then(decodeResponse); //<- return Promise interface
		};

		/**
		 * Updates the custom metadata only (metadata.customMetadata)
		 * @method
		 * @param  {string} uri       full URI, including the "safe" filename
		 * @param  {[type]} rqOptions Request options (Only "customMetadata" attribute used here)
		 * @return {Promise}           Promise <metadata>
		 */
		self._doUpdate = function(uri, rqOptions) {
			var metadata = encodeMetadata(assertDefined(rqOptions.data),
				'Update error: rqOptions.data is not defined!') ;
			return self._svcHandle.ref(uri).updateMetadata(metadata).then(decodeMetadata);
		}

		/**
		 * Read metadata for file at specific uri
		 * @method _doRead
		 * @param  {[type]} uri [description]
		 * @return {[type]}          [description]
		 */
		self._doRead = function(uri, rqOptions) {
			// Note: here is one-time listener which listens to the "value" changes
			// chain result with: .then(function(data){}).catch(function(error){})
			return self._svcHandle
				.ref(uri)
				.getMetadata()
				.then(decodeMetadata);
		};

		/**
		 * Delete file from storage
		 * @method delete
		 * @param  {[type]} uri [description]
		 * @return {[type]}          [description]
		 */
		self._doDelete = function(uri, rqOptions) {
			// returns Firebase Promise
			// chain result with: .then(function(){}).catch(function(error){})
			return self._svcHandle
				.ref(uri)
				.delete();
		}

		self.signIn = function (args) {
			var p;
			if (self.isSigned()) 
				return Promise.resolve(self._auth.currentUser);
			if (args.email) 
				p = self._auth.signInWithEmailAndPassword(args.email, args.password);
			else
				p = self._auth.signInAnonymously();
			return p.then(function (response) {
				return self._auth.currentUser; 
			}).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				// ...
				return Promise.reject(new FirebaseAuthError('AuthError: '+errorMessage, {code: errorCode}));
			});
		}

		self.signOut = function () {
			return self._auth.signOut();
		}

		self.isSigned = function () {
			return (!!self._auth) && (!!self._auth.currentUser);
		}

		self.user = function () {
			return (self._auth && self._auth.currentUser) || {
				uid: 'guest',
				displayName: 'Guest',
				isAnonymous: true
			}
		}

		// Map methods to verbs:
		self.methodsMap({
			'create': '_doCreate',
			'update': '_doUpdate',
			'read': '_doRead',
			'delete': '_doDelete'
		});

		return self;
	}

	Transport.registry.uriScheme['firebase-db'] = FirebaseDB;
	/**
	 * [FirebaseDB description]
	 * @constructor
	 * @this {FirebaseDB}
	 * @param  {object}   options     Options:
	 * @param  {function}   mapLocation Maps endpoint URL to the DB scheme. Default: returns url itself.
	 */
	function FirebaseDB(url, options) {
		var
			self = FirebaseStorage(url, options);
			// self = {
			// 	methodsMap: function(argument) {
			// 		// body...
			// 	}				
			// };

		console.log('Create FirebaseDB Instance...');

		// Firebase path can't contain ".", "#", "$", "[", or "]"":
		self._escapePath = function (value) {
			return value.replace(/[\.\#\[\]\$]/gi, '_');
		}

		// Firebase initialization:
		self.init = function(fbConfig, appName) {
			self._fbConfig = assertDefined(fbConfig, 
				'Firebase config attribute is missed in the transport.init(fbConfig) call!');
			self._firebase = initFirebaseApp(self._fbConfig, appName);

			self._auth = self._firebase.auth();
			// Initiates Firebase auth and listen to auth state changes.
			// self._auth.onAuthStateChanged(function (user) {
			// 	self._user = user;
			// });

			self._svcHandle = self._firebase.database();
			return self;
		};

		self._tname = 'FirebaseDB';
		self._defErrorClass = FirebaseDBError;

		/* API reference for used methods:
		 https://firebase.google.com/docs/reference/js/firebase.database.Reference

		Example for "set" method:

		adaNameRef.set({ first: 'Ada', last: 'Lovelace' })
		  .then(function() {
		    ...
		  })
		  .catch(function(error) {
		    ...
		  });

		Note. This model does not distinguish between "create" and "update",
		the front-end must keep internal keys (for "filtering") itself.
		*/

		/**
		 * Create or update resource
		 * @method create
		 * @param  {string} uri   URL-like string which identifies object in JSON database
		 * @param  {File} data       File API object
		 * @param  {object} metadata   File metadata (firebase)
		 * @param  {function} onDone Handler to invoke on success
		 * @param  {function} onError Handler to invoke on error
		 * @return {firebase.Promise}            description
		 */
		self._doCreate = function(uri, rqOptions) {
			// returns Promise: then, catch.
			// chain result with: .then(function(){}).catch(function(error){})
			// More: https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask
			var
				o = assertDefined(rqOptions,
					'FirebaseDB.create() requires "rqOptions" argument!'),
				data = assertDefined(o['data'],
					'FirebaseDB.create() requires "rqOptions.data" attribute!');

			console.log('FirebaseDB->_doCreate', o, data);
			return self._svcHandle.ref(uri).set(data);
		}

		self._doUpdate = function(uri, rqOptions) {
			// Allows partial update of properties in existing object.
			// returns Promise: then, catch.
			// chain result with: .then(function(){}).catch(function(error){})
			// More: https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask
			var
				o = assertDefined(rqOptions,
					'FirebaseDB.update() requires "rqOptions" argument!'),
				data = assertDefined(o['data'],
					'FirebaseDB.update() requires "rqOptions.data" attribute!');

			return self._svcHandle.ref(uri).update(data);
		}

		/**
		 * Read resource
		 *
		 * @param  {string} uri  URL-like string which identifies object in JSON database
		 * @return {object}          description
		 */
		self._doRead = function(uri, rqOptions) {
			// Note: here is one-time listener which listens to the "value" changes
			// chain result with: .then(function(data){}).catch(function(error){})
			return self._svcHandle.ref(uri).once("value").then(function (snapshot) {
				return snapshot.val();
			});
		}

		self._doDelete = function(uri, rqOptions) {
			// returns Firebase Promise
			// chain result with: .then(function(){}).catch(function(error){})
			return self._svcHandle.ref(uri).remove();
		}

		self._doQuery = function(uri, rqOptions) {
			var
				o = assertDefined(rqOptions,
					'FirebaseDB.query() requires "rqOptions" argument!'),
				qryArgs = assertDefined(o.qryArgs,
					'FirebaseDB.query() argument requires "qryArgs" attribute!');
			var ref = self._svcHandle.ref(uri);
			// "Chain" filters:
			for (var key in qryArgs) {
				ref = ref.orderByChild(key).equalTo(qryArgs[key]);
			}
			// chain result with: .then(function(data){}).catch(function(error){})
			return ref.once("value");
		}

		// Map methods to verbs:
		self.methodsMap({
			'create': '_doCreate',
			'update': '_doUpdate',
			'read': '_doRead',
			'delete': '_doDelete',
			'query': '_doQuery'
		});

		return self;
	}

	console.log('IO.FIREBASE PASSED');

	return _.extend(IO, {
		FirebaseStorage: FirebaseStorage,
		FirebaseDB: FirebaseDB
	});

}));
