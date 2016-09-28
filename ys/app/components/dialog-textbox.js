//dialog-textbox.js
define(['plugins/dialog', 'knockout.all'], function (dialog, ko) {

	/*////////////////////////////////////////////////////////
	//
	// Edit text value
	//
	*/////////////////////////////////////////////////////////

	var DialogViewModel = function (options) {
		this.StrBuffer = ko._obs_(options.value || '');
		this.Title = options.title || '';
	};

	// Accept:
	DialogViewModel.prototype.onSubmit = function () {
		dialog.close(this, this.StrBuffer());
		// Update selection info (!)
	};

	// Cancel:
	DialogViewModel.prototype.onCancel = function () {
		dialog.close(this);
	};

	DialogViewModel.show = function (options) {
		return dialog.show(new DialogViewModel(options));
	};

	return DialogViewModel;

});