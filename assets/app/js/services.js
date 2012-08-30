'use strict';

//
// Module : DevicesModule
//
// Services : 
//      getMessagesBefore
//      getMessagesAfter
angular.module('DevicesModule', ['ngCookies'], function($provide) {

    $provide.factory('DevicesServices', function($http, $log, $cookieStore, CONSTANTS) {

        var dtoken = $cookieStore.get('dtoken');

        return {

            // getMessagesBefore method
            getMessagesBefore: function(sn, before, amount) {
                var url = CONSTANTS.remote + '/mcs/devices/msgs/history.json';
                $log.info('url built up', url);

				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        sn : sn,
                        until : before,
                        amount : amount
                    },
                    headers : {
                        'x-snsr-device-key' : dtoken
                    }
                });
            },

            // getMessagesAfter method
			getMessagesAfter: function(sn, after, amount) {
                var url = CONSTANTS.remote + '/mcs/devices/msgs/recents.json';
                $log.info('url built up', url);

				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        sn : sn,
                        after : after ,
                        amount : amount
                    },
                    headers : {
                        'x-snsr-device-key' : dtoken
                    }
                });

			} 
        }
    });
});


//
// Module : SecurityModule
//
// Services : 
//      checkCRC
//      registration
//      authentication
//      deleteAccount
angular.module('SecurityModule', []).factory('SecurityServices', function($rootScope, $http, $cookieStore, CONSTANTS) {
    return {
            // checkCRC method
            checkCRC : function(inputSerial, inputKey) {
                return $http({
                    method : 'GET',
                    url : CONSTANTS.remote + '/mcs/devices/crc.json',
                    params : {  
                        sn : inputSerial,
                        key : inputKey
                    }
                });
            },

            // registration method
            registration: function(account) {
                return $http({
                    method : 'POST',
                    url : CONSTANTS.remote + '/mcs/register.json',
                    data : account
                });
            },

            // authentication method            
            authentication: function(account) {
                var utoken = $cookieStore.get('utoken');
                return $http({
                    method : 'GET',
                    url : CONSTANTS.remote + '/security/authentication',
                    params : {
                        account : account
                    },
                    headers : {
                        Authorization : 'Basic ' + utoken
                    }
                });
            },

            // delete account method
            deleteAccount: function(email) {
                var utoken = $cookieStore.get('utoken');
                return $http({
                    method : 'DELETE',
                    url : CONSTANTS.remote + '/mcs/developers.json',
                    params : {
                        email : email
                    },
                    headers : {
                        Authorization : 'Basic ' + utoken
                    }
                });
            }
        }
});

angular.module('myModule', []).factory('mySharedService', function($rootScope) {
    var sharedService = {};

    sharedService.displayDashboard = '';

    sharedService.prepareDisplayDashboard = function() {
        this.displayDashboard = 'true';
        this.displayDashboardItem();
    };

    sharedService.prepareHideDashboard = function() {
        this.displayDashboard = 'false';
        this.displayDashboardItem();
    };

    sharedService.displayDashboardItem = function() {
        $rootScope.$broadcast('handleDisplayDashboard');
    };

    return sharedService;
});