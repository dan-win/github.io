//config.js

// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (obj) {
		MODULES.config = obj;
	}
}

define({
	// 'assetStorage':'local',
	// 'dataStorage': ''
	'storages': {
		'media': 'gs://ys-media',
		'db': 'firebase-db://ys-data',
		'config': {
			apiKey: "AIzaSyCYwYFEAnnXaVE-rDVUmEr5IXENEd9Ol24",
			authDomain: "io-firebase-unittest.firebaseapp.com",
			databaseURL: "https://io-firebase-unittest.firebaseio.com",
			storageBucket: "io-firebase-unittest.appspot.com",
			// messagingSenderId: "914902878760"
		}
		// 'asset': {
		// 	'storageType' : 'local:localStorage',
		// 	'storagePrefix': '/api',
		// },
		// 'data': {
		// 	'storageType' : 'local:localStorage',
		// 	'storagePrefix': '/api',
		// }
	},
	// This attribute depends on transport implementation (in this ample this is Firebase)
	// 'authData': {
	//     apiKey: "AIzaSyCjdskLiRkaymEG3XePbpePpBHNsHQDMEg",
	//     authDomain: "ycdn-2d466.firebaseapp.com",
	//     databaseURL: "https://ycdn-2d466.firebaseio.com",
	//     storageBucket: "ycdn-2d466.appspot.com",
	// },
	DEVMODE: true,
	// full path to the glyps for assets:
	glyhpRoot : '/thumbnail',
	// full path to the assets:
	mediaRoot : '/data',
	templatesRoot	: ''

});