'use strict';

var app = angular.module('evbApp', ['DevicesModule', 'SecurityModule', 'Context', 'NotificationModule'],function($routeProvider, $locationProvider, $httpProvider) {
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
            Context.setSimulatorVisibility(false);   
    		$log.info("settings ok");
    	} else {
    		$log.info("no token found => clearing information");
    		Context.setSerial(undefined);
    		Context.setDashBoardVisibilty(false);	
            Context.setSimulatorVisibility(false);   
    	}
    });
});

//app.constant('CONSTANTS', {remote : 'http://localhost:9010'});
app.constant('CONSTANTS', {remote : 'https://sensor.insgroup.fr'});
//app.constant('CONSTANTS', {remote : 'http://192.168.1.14:9010'});
