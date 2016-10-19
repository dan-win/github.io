/*
preprocess.dom.js
Pre-process html before running jQuery plugins
(set attributes, etc.)
 */

/**
 * Setup common behaviour for each slide, if such attributes defined in '.tp-banner'
 */
(function () {
	console.log('preprocess...')
    var $tpBanner = $('.tp-banner');
    console.log($tpBanner);
    var bgfit = $tpBanner.attr('data-slide-img-bgfit');
    var bgposition = $tpBanner.attr('data-slide-img-bgposition');
    var $imgCollection = $tpBanner.find('ul>li>img');
    console.log($imgCollection);
    if (bgfit || bgposition) {
        var settings = {};
        if (bgfit) settings['data-bgfit'] = bgfit;
        if (bgposition) settings['data-bgposition'] = bgposition;
        $imgCollection.each(function (index, el) {
            $(el).attr(settings)
            console.log('img attr: ', settings, el);
        })
    }
})($);