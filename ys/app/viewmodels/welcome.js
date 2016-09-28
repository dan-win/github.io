// define(function() { // <- fix 622 https://github.com/BlueSpire/Durandal/commit/9fef47e339725bf0691ee8012cd87353d647ff60
define(['durandal/app'], function (app) {
        var ctor = function () {
        this.displayName = 'Welcome to the yScreens!';
        this.description = '';
        this.features = [
        ];
    };
    
    return ctor;
});