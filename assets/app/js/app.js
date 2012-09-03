'use strict';

var app = angular.module('evbApp', ['DevicesModule', 'SecurityModule', 'Context']).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});

app.run(function($log, $cookieStore, Context, $timeout) {
	$log.info("config step");
	var token = $cookieStore.get('dtoken');
	$log.info("token information", token);
    $timeout(function() {
    	if (undefined != token) {
    		// decode token to get the serial
    		var clear = base64.decode(token);
    		var sn = clear.split(":")[0];
    		sn = sn.substring(sn.length-4);
    		$log.info("serial", sn);
    		Context.setSerial(sn);
    		Context.setDashBoardVisibilty(true);
    		$log.info("settings ok");
    	} else {
    		$log.info("no token found => clearing information");
    		Context.setSerial(undefined);
    		Context.setDashBoardVisibilty(false);	
    	}
    });
});


//app.constant('CONSTANTS', {remote : 'http://localhost:9010'});
app.constant('CONSTANTS', {remote : 'http://sensor.insgroup.fr'});
//app.constant('CONSTANTS', {remote : 'http://192.168.0.42:9010'});
