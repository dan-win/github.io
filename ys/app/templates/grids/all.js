//grids registry
// STUB FOR DEBUGGING
if (typeof define !== "function" || !define.amd) {
	define = function (obj) {
		MODULES.templates_grids_all = obj;
	}
}

define({
	// Registry of temlates
	// for templates in current folder
	// format:
	// 'template_id': {label, filename, supported media}
	'default': {label:'Default', filename:'default', media:[]},
	'decorated': {label:'Decorated', filename: 'decorated'}
})
