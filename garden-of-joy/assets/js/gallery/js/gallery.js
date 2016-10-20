// danwin. Gallery for img
// <img ...>
/*
<div class="container img-gallery">
	<div class="row filter scrollpoint sp-effect1">
		<div class="col-xs-1 col-md-4 col-lg-3">
			<a href="#" class="thumbnail">
				<img class="img-responsive" src="assets/img/slides/img02.jpg"/>
			</a>
		</div>
 */
if (!jQuery) {
	throw new Error('Gallery plugin requires jQuery');
}

(function ($) {
	// Install plugin
	$(function () {
		// find all galleries
		var collection = $('*[data-sh-image-gallery="mosaic"]');

		collection.each(function (ignore, collectionInstance) {
			var Sgallery = $(collectionInstance);
			var cols = parseInt(Sgallery.attr('data-bs-col-count') || 2);
			var colMultiplier = Math.ceil(12/cols);
			var colClass = 'col-xs-1 col-sm-'+colMultiplier;
			// var colsForRow = [];
			var rowCount = 1;
			var rowClass;
			Sgallery.children('img').each(function (index, img) {
				var isRowEnd = (index + 1) % cols === 0, $cell;
				rowClass = 'rownum-'+rowCount;
				Scell = $('<div/>')
					.addClass(colClass)
					// .addClass('scrollpoint sp-effect5')
					.addClass(rowClass);
				$(img)
					.addClass('img-responsive')
					.wrap(Scell)
					.wrap('<a href="#" class="thumbnail"></a>');
				if (isRowEnd) {
					console.log(index, Sgallery.find('.'+rowClass));
					Sgallery
						.children('.'+rowClass)
						.wrapAll('<div class="row scrollpoint sp-effect5"></div>');
					rowCount++;
				}

			})
			// try to wrap remaining cells if their count less than the cols:
			Sgallery
				.children('.'+rowClass)
				.wrapAll('<div class="row scrollpoint sp-effect5"></div>');
			// Sgallery.wrapInner('<div class="row"></div>')

		});
	});
	// Add modal preview window
	$(document.body).append('\
		<div id="image-gallery-preview" class="modal fade" tabindex="-1" role="dialog">\
		  <div class="modal-dialog modal-lg" role="document">\
		    <div class="modal-content">\
		      <div class="modal-header">\
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
		        <h4 class="modal-title">&nbsp;</h4>\
		      </div>\
		      <div class="modal-body"></div>\
		    </div><!-- /.modal-content -->\
		  </div><!-- /.modal-dialog -->\
		</div><!-- /.modal -->\
		');
	$('*[data-sh-image-gallery="mosaic"]').on('click', 'a.thumbnail', function (evt) {
		console.log(this)
		console.log(evt);
		var Sdialog = $('#image-gallery-preview');
		var Sa = $(this);
		var Simg = Sa.children('img');
		var src = Simg.attr('src');
		console.log(Simg);
		// return
		Sdialog
			.find('.modal-body')
			.html('')
			.append(
				$('<img/>')
					.addClass('img-responsive')
					.attr('src', src)
				);
		Sdialog.modal('show');

	})
})(jQuery);