'use strict';
var app = angular.module('evbApp', ['DevelopersModule','DevicesModule', 'SecurityModule', 'Context', 'NotificationModule','ui.bootstrap','ngTable'],function($routeProvider, $locationProvider, $httpProvider) {
	//delete $httpProvider.defaults.headers.common['X-Requested-With'];
	//$httpProvider.defaults.withCredentials = true;
	
	
	//$locationProvider.html5Mode(true);
	var interceptor = ['$rootScope', '$q', function (scope, $q) {

	        function success(response) {
	            return response;
	        }

	        function error(response) {
	            var status = response.status;

				switch (status) {
					case 401:
						var deferred = $q.defer();
	                	var req = {
	                    	config:response.config,
	                    	deferred:deferred
	                	};
						scope.$broadcast('event:loginRequired');
					break;
					case 500:
						var deferred = $q.defer();
		                var req = {
		                    config:response.config,
		                    deferred:deferred
		                };
						scope.$broadcast('event:serverError');
					break;
				}
				return $q.reject(response);

	        }

	        return function (promise) {
	            return promise.then(success, error);
	        };

	    }];

	    $httpProvider.responseInterceptors.push(interceptor);

    }).directive('whenScrolled', function() {
        return function(scope, elm, attr) {
            var raw = elm[0];
            elm.bind('scroll', function() {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.whenScrolled);
                }
            });
        };
    });

app.config(function($compileProvider){
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|javascript):/);
});

app.run(function($log, $cookieStore, Context, $timeout) {
	$log.info("app config step");

	var dtoken = $cookieStore.get('dtoken');
	var utoken = $cookieStore.get('utoken');
    var currenturl = document.URL;

    $log.info("currenturl : " + currenturl);
	$log.info("dtoken information : ", dtoken);
	$log.info("utoken information : ", utoken);

    var deviceSuffix = "device.html";
    var developerSuffix = "developer.html";

    var deviceContext = currenturl.match(deviceSuffix+"$")==deviceSuffix;
    var developerContext = currenturl.match(developerSuffix+"$")==developerSuffix;

    $timeout(function() {
    	if (undefined != dtoken && deviceContext) {
    		// decode token to get the serial
    		var clear = base64.decode(dtoken);
    		var sn = clear.split(":")[0];
    		sn = sn.substring(sn.length-4);
    		$log.info("serial : ", sn);
    		Context.setSerial(sn);
    		Context.setDashBoardVisibilty(true);
       		$log.info("settings Device ok");
    	} if (undefined != utoken && developerContext) {
    		Context.setSerial(undefined);
    		Context.setDashBoardVisibilty(true);
    		$log.info("settings Developer ok");
    	} else {
    		$log.info("no token found => clearing information");
    		Context.setSerial(undefined);
    		Context.setDashBoardVisibilty(false);
    	}
    });
});

app.factory('Base64', function () {
 
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

//app.constant('CONSTANTS', {remote : 'http://192.168.1.41:9010'});
app.constant('CONSTANTS', {remote : 'https://sensor.insgroup.fr'});
//app.constant('CONSTANTS', {remote : 'http://127.0.0.1:9010'});
//app.constant('CONSTANTS', {remote : 'http://sandbox.insgroup.fr'});
