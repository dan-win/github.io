//dialog-layout.js
define(['plugins/dialog', 'knockout.all'], function (dialog, ko) {

	/*////////////////////////////////////////////////////////
	//
	// Select grid template
	//
	*/////////////////////////////////////////////////////////

	var DialogViewModel = function (root) {
		var target = root; 

		this.TemplateInfo = ko._obs_(null); // no default sel value
		this.Gallery = ko._obsA_(target["GridGallery"]()); 

		// this.TemplateID = ko.pureComputed(function () {
		// 	return ko._traverseTree_(this, ['TemplateInfo', 'PresetID'], true);
		// });

		this.TemplateID = function () {
			var TemplateInfo = this.TemplateInfo(); // <-- do not hide this into nested funcs (dependency will be lost)
			if (TemplateInfo) return TemplateInfo.PresetID;
			return null;
		};

		// Accept:
		// this.onSubmit = function () {
		// 	_TRACE_('ko._traverseTree_(target, ["ActiveLayer", "TemplateInfo"])', ko._traverseTree_(target, ['ActiveLayer', 'TemplateInfo']));

		// 	ko._traverseTree_(target, ['ActiveLayer', 'TemplateInfo']) (ko._fromObs_(this.TemplateInfo));

		// 	_TRACE_('selected template: ', this.TemplateInfo());

		// 	// Update selection info (!)
		// }
	};

	// Accept:
	DialogViewModel.prototype.onSubmit = function () {
		dialog.close(this, this.TemplateInfo());
		// Update selection info (!)
	};

	// Cancel:
	DialogViewModel.prototype.onCancel = function () {
		dialog.close(this);
	};

	DialogViewModel.show = function (root) {
		return dialog.show(new DialogViewModel(root));
	};

	return DialogViewModel;

});