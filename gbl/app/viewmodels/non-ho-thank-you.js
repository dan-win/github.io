// define(function() { // <- fix 622 https://github.com/BlueSpire/Durandal/commit/9fef47e339725bf0691ee8012cd87353d647ff60
define(['durandal/app'], function (app) {
    var ctor = function () {
    	var self = this;
        this.displayName = 'Guarantor Loan';
        this.description = 'Under construction';

        this.activate = function (appId) {
        	self.appId = appId;
        }
    };
    
    return ctor;
});