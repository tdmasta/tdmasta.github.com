'use strict';
var app = angular.module('evbApp', ['DevelopersModule','DevicesModule', 'SecurityModule', 'Context', 'NotificationModule','ui.bootstrap','ngTable'],function($routeProvider, $locationProvider, $httpProvider) {
	//delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$httpProvider.defaults.withCredentials = true;
	
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
	                	}
						scope.$broadcast('event:loginRequired');
					break;
					case 500:
						var deferred = $q.defer();
		                var req = {
		                    config:response.config,
		                    deferred:deferred
		                }
						scope.$broadcast('event:serverError');
					break;
					default:
		            return $q.reject(response);
				}
	            // otherwise

	        }

	        return function (promise) {
	            return promise.then(success, error);
	        }

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
    }
);

app.config(function($compileProvider){
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|javascript):/);
});

app.run(function($log, $cookieStore, Context, $timeout) {
	$log.info("config step");
	var dtoken = $cookieStore.get('dtoken');
	var utoken = $cookieStore.get('utoken');
	$log.info("dtoken information", dtoken);
	$log.info("utoken information", utoken);
    $timeout(function() {
    	if (undefined != dtoken) {
    		// decode token to get the serial
    		var clear = base64.decode(dtoken);
    		var sn = clear.split(":")[0];
    		sn = sn.substring(sn.length-4);
    		$log.info("serial", sn);
    		Context.setSerial(sn);
    		Context.setDashBoardVisibilty(true);
    		$log.info("settings Device ok");
    	} if (undefined != utoken) {
    		// decode token to get the serial
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

//app.constant('CONSTANTS', {remote : 'http://localhost:9010'});
app.constant('CONSTANTS', {remote : 'https://sensor.insgroup.fr'});
//app.constant('CONSTANTS', {remote : 'http://192.168.1.15:9010'});
