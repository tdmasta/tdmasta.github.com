'use strict';

angular.module('MCSDeviceServices', ['ngCookies'], function($provide) {

    $provide.factory('MCSDevices',function($http, $log, $cookieStore, CONSTANTS) {

        var _key = $cookieStore.get('mcstoken');

        return {
            getMessagesBefore : function(sn, before, amount) {

                /**
                if (!_key) {
                    alert("No valid Key");
                    return;
                }*/

                var url = CONSTANTS.remote + '/mcs/devices/msgs/history.json';
                var token = 'Basic ' + _key;
                $log.info('url built up', url);
				
				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        'sn' : sn,
                        'until': before,
                        'amount': amount
                    },
                    headers : {
                        'Authorization' : token
                    }
                });
            },

			getMessagesAfter: function(sn, after, amount) {
                var url = CONSTANTS.remote + '/mcs/devices/msgs/recents.json';
                var token = 'Basic ' + _key;
                $log.info('url built up', url);
				
				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        'sn' : sn,
                        'after': after ,
                        'amount': amount
                    },
                    headers : {
                        'Authorization' : token
                    }
                });

			} 
        }
    });
});