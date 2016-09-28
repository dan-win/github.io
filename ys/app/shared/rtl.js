//rtl.js
// runtime library for playback
// UMD wrapping for module used (for plain JS, AMD or CommonJS modes)
(function (root, factory) {
	var _modname = 'rtl';
    if (typeof define === "function" && define.amd) { // AMD mode
        define(["jquery", "json2"], factory);
    } else if (typeof exports === "object") { // CommonJS mode
        module.exports = factory(require("jquery"), require("json2"));
    } else {
        root[_modname] = factory(root.$, root.JSON); // Plain JS, "rtl" is in window scope
    }
}(this, function ($) {
    // this is where I defined my module implementation

    var debug_count = 0;

    var _Player_lastQueue_ = 0;

    var Scene = function (targetSelector, data) {
    	var
    		self = this,
    		est_period = 0;

    	self.targetSelector = targetSelector;
    	// JSON i/o - ko.mapping?
    	self.objects = []; // for Knockout migration - make it observable
    	self.runners = []; // for Knockout migration - make it observable // <--- obsolete

    	// sparse array where index is a time in seconds and items are true/false (event flag)
    	self.timeThresholds = [];
    	self.timer = null;
    	self.second = 0;

    	self.isRunning = false;

		self.period = data && data.duration/1000 || null; // for Knockout migration - make it observable
		self.quantum = data && data.quantum || 13; // jQuery default interval for animations update rate, ms

		self.clear = function () {
			for (var i=0, len=self.objects.length, objectSelector; i<len; i++) {
				objectSelector = self.objects[i][1];
				$(objectSelector).remove();
			}
	    	self.objects = []; // for Knockout migration - make it observable

			// If scene built from setScene and .objects[] is empty:
			$(self.targetSelector).html('');

	    	self.runners = []; // for Knockout migration - make it observable

	    	self.timeThresholds = [];
	    	if (self.timer) clearInterval(self.timer);
	    	self.second = 0;
	    	$(self.targetSelector).off('.playback'); // clear handlers

	    	est_period = 0;
		}

		self.initScene = function () {
			var parentSelector, objectSelector, html;
			for (var i=0,len=self.objects.length; i<len; i++) {

				parentSelector = self.objects[i][0];
				objectSelector = self.objects[i][1];
				html = self.objects[i][2];

				$(html).appendTo(parentSelector);
				$(objectSelector).addClass('meta-anim');
			}
		}

		var prepareKeyframes = function () {
			// create array where items equals to time of latest event and index is a time;
			// example of timeThresolds: [null, null, null, null, true, null, ....]
			// example for keyframes: : [0,0,0,0,4,4,4,6,6,....]
			var 
				timeGrid = self.timeThresholds.slice(0),
				keyframes = [],
				currentEvent = 0;

			timeGrid.sort(function (a, b) {
				return a-b;
			});

			for (var second = 0; second < timeGrid.length; second++) {
				if (timeGrid[i]) currentEvent = second;
				keyframes.push(currentEvent);
			}

			return keyframes;
		}

		self.run = function () {

			var period = (self.period || est_period);
			console.log('period: ', period, self.period, est_period);

			// resume if paused:
			if (self.timer && !self.isRunning) {
				self.isRunning = true;
				return;
			}

			if (self.quantum != 13) $.fx.interval = self.quantum;

			self.second = 0;

			self.timer = setInterval( function () {

				if (!self.isRunning) return;

				if (self.timeThresholds[self.second]) {
					$(targetSelector).triggerHandler('tick_'+self.second+'.playback');
					// console.log('event fired: ' + 'tick_'+self.second+'.playback');
				}
				self.second = (self.second > period) ? 0 : self.second+1;
				// console.log(self.second);
			}, 1000);

			self.isRunning = true;
		}


		self.runEx = function (multiplier) {

			var period = (self.period || est_period);
			console.log('runEx, period: ', period, self.period, est_period);

			multiplier = multiplier || 1;

			// resume if paused:
			if (self.timer && !self.isRunning) {
				self.isRunning = true;
				return;
			}

			if (self.quantum != 13) $.fx.interval = self.quantum;

			self.second = 0;

			self.keyframes = prepareKeyframes();

			var lastKey = -1, key;

			self.timer = setInterval( function () {

				if (!self.isRunning) return;

				key = keyframes[self.second];

				if (lastKey !== key) {
					$(targetSelector).triggerHandler('tick_'+key+'.playback');
					// console.log('event fired: ' + 'tick_'+self.second+'.playback');
					lastKey = key;
				}

				self.second = (self.second > period) ? 0 : self.second+multiplier;
				// console.log(self.second);
			}, 1000 * multiplier);

			self.isRunning = true;

		}

		self.stop = function () {
			self.isRunning = false;
			if (self.timer) clearInterval(self.timer);
			self.second = 0;
		}

		self.rewind = function (time) {
			// to-do: test in composer
			// find nearest keyframe:
			while (time > 0 && !self.timeThresholds[time]) time--;
			self.second = time;
			$(targetSelector).triggerHandler('tick_'+time+'.playback');
		}

		self.pause = function () {
			self.isRunning = false;
		}

		self.resume = function () {
			self.isRunning = true;
		}

		self.fromJSON = function (data) {
			// data - json text, parentSelector - optional parameter to render into
			var js = JSON.parse(data),
			html = js.scene,
			motion = js.motion;

			console.log('JSON:', js );

			self.setScene(html, self.targetSelector);

			for (var i=0, len=motion.length; i<len; i++) {
				self.addBehavior(motion[i]);
				// console.log('Adding :', motion[i] );
			}
		}

		self.addObject = function (parentSelector, objectSelector, html) {
			if (typeof html !== 'string') throw new Error('HTML argument must be a string!');
			self.objects.push([parentSelector, objectSelector, html]);
		}

		self.setScene = function (html) {

			$(html).appendTo(self.targetSelector)
		}

		self.addBehavior = function (data) {
			// body...
			var
				hiddenMs = data.hiddenMs || 0,
				ascentMs = data.ascentMs || 0,
				visibleMs = data.visibleMs,
				descentMs = data.descentMs || 0,

				ascentMethod = data.ascentMethod || 'show',
				descentMethod = data.descentMethod || 'hide',

				visibleMethod = data.visibleMethod || 'delay',

				objectSelector = data.DOMselector,

				$el = $(objectSelector), style = $el.attr('style'),


				t_count = 0,

				t_presence = data.duration/1000,
				trajectory, 
				loop,

				e1 = Math.ceil(hiddenMs/1000),
				e2 = e1+Math.ceil(ascentMs/1000),
				e3 = e2+Math.ceil(visibleMs/1000),
				e4 = e3+Math.ceil(descentMs/1000),

				qName = 'queue_'+_Player_lastQueue_;

			_Player_lastQueue_++;


			// Update estimation of period
			est_period = Math.max(est_period, hiddenMs/1000 + t_presence);
			console.log('visibleMs: ',visibleMs,'; t_presence: ', t_presence, '; est_period: ', est_period);

			$(self.targetSelector)
				.on('tick_'+(e1)+'.playback', function () {$el[ascentMethod](ascentMs)})
				.on('tick_'+(e2)+'.playback', function () {$el[visibleMethod](visibleMs)})
				.on('tick_'+(e3)+'.playback', function () {$el[descentMethod](descentMs)})
				.on('tick_'+(e4)+'.playback', function () {$el.hide().attr('style', style)});

			self.timeThresholds[e1] = true;
			self.timeThresholds[e2] = true;
			self.timeThresholds[e3] = true;
			self.timeThresholds[e4] = true;
		}
    }

    return Scene; // Possibly, sceneMapping will be added (internally) for ko.fromJS/toJS persistence?

}));


/*

Sample code for loop of animation:

function runIt() {
  div
    .show( "slow" )
    .animate({ left: "+=200" }, 2000 )
    .slideToggle( 1000 )
    .slideToggle( "fast" )
    .animate({ left: "-=200" }, 1500 )
    .hide( "slow" )
    .show( 1200 )
    .slideUp( "normal", runIt );
}
 
function showIt() {
  var n = div.queue( "fx" );
  $( "span" ).text( n.length );
  setTimeout( showIt, 100 );
}
 
runIt();
showIt();

*/