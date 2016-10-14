//output-snippets.js
// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (obj) {
		MODULES.output_snippets = obj;
	}
}
define({
	"<undefined>":
			'<div>Undefined type</div>',
	"Text": 
			'<div>{Label}</div>',
	// img-responsive from Bootstrap 3: 
	"Image": 
			'<img src="{Src}" class="img-responsive center-block"/>',
	"Video": 
			'<div class="embed-responsive embed-responsive-16by9">\
				<video id="{StorageID}" preload="auto" width="{Width}" height="{Height}" class="embed-responsive-item"> \
					 <source src="{Src}" type="{MimeType}" autostart="false"/> \
				</video>\
			</div>',
	"RSS": 
			'<div>RSS</div>',
	"Twitter":
			'<div>Twitter</div>'
});
