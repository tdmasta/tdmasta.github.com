'use strict';

var app = angular.module('evbApp', ['DevicesModule', 'SecurityModule', 'myModule']).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});


//app.constant('CONSTANTS', {remote : 'http://localhost:9010'});
app.constant('CONSTANTS', {remote : 'http://sensor.insgroup.fr'});
//app.constant('CONSTANTS', {remote : 'http://192.168.0.42:9010'});