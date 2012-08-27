'use strict';

angular.module('MCSDeviceServices', ['ngCookies'], function($provide) {

    $provide.factory('MCSDevices',function($http, $log, $cookieStore, CONSTANTS) {

        var _key = $cookieStore.get('mcstoken');

        return {
            getMessages : function(sn, until, amount) {

                /**
                if (!_key) {
                    alert("No valid Key");
                    return;
                }*/

                var url = CONSTANTS.remote + '/mcs/devices/msgs.json';
                var token = 'Basic ' + _key;
                $log.info('url built up', url);

                $http({
                    method : 'GET',
                    url : url,
                    params : {
                        'sn' : sn,
                        'until': until,
                        'amount': amount
                    },
                    headers : {
                        'Authorization' : token
                    }
                }).success(function(response) {
                    $log.info("response on success", response);
                    return response.data;
                }).error(function(response) {
                    $log.error("response on ERROR ", response);
                    return response.data;
                })
            }
        }
    });
});