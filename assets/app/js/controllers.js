'use strict';

/* 
 * Controllers
*/

// Authentication controller
function authenticationCtrl($scope, $http, $log, $cookieStore, CONSTANTS) {

    // AuthenticationBySerialSubmit button
    $scope.authenticationBySerialSubmit = function() {
        var hosturl = CONSTANTS.remote;

        if ($scope.account && $scope.account.inputSerial && $scope.account.inputKey) {

            // checkCRC method
            $http({
                method : 'GET',
                url : hosturl + '/mcs/devices/crc.json',
                params : {
                    'sn' : $scope.account.inputSerial,
                    'key' : $scope.account.inputKey
                }
            }).success(function(data, status) {
                $log.info('checkCRC OK : data = ' + data);
                $cookieStore.put('dtoken', data);
            }).error(function(data, status) {
                $log.error('checkCRC KO : Failed request status = ' + status + ' & data = ' + data);
                $cookieStore.put('dtoken', null);
            });
        }
    };

    // AuthenticationByEmailSubmit button
    $scope.authenticationByEmailSubmit = function() {
        alert('By Email Submit : ' + JSON.stringify($scope.account));
    };

}


// Registration controller
function RegistrationCtrl($scope, $http, $log, $cookieStore, CONSTANTS) {

    // Registration button
    $scope.registrationSubmit = function() {
        var hosturl = CONSTANTS.remote;

        // 'POST' method without Authorization
        $http({
            method : 'POST',
            url : hosturl + '/mcs/register.json',
            data : $scope.account
        }).success(function(data, status) {
            $cookieStore.put('utoken', data);
            $log.info('Registration OK : utoken = ' + data);
        }).error(function(data, status) {
            $cookieStore.put('utoken', null);
            $log.error('Registration KO : Failed request status = ' + status + ' & data = ' + data);
        });

        /**
            // 'GET' method with Authorization
            $http({
                method : 'GET',
                url : hosturl + '/security/authentication',
                params : {
                    'account' : $scope.account
                },
                headers : {
                    'Authorization' : 'Basic Y2hyaXN0b3VpbGhlQGhvdG1haWwuZnI6cG9wb3BvcG8='
                }
            }).success(function(data, status) {
                $log.info('Authentication OK : data = ' + data);
            }).error(function(data, status) {
                $log.error('Authentication KO : Failed request status = ' + status + ' & data = ' + data);
            });
        */
    };

    // Delete button
    $scope.deleteClick = function() {
        if ($scope.account && $scope.account.email) {
            var utoken = $cookieStore.get('utoken');
            if (utoken) {
                var hosturl = CONSTANTS.remote;

                $http({
                    method : 'DELETE',
                    url : hosturl + '/mcs/developers.json',
                    params : {
                        'email' : $scope.account.email
                    },
                    headers : {
                        'Authorization' : ['Basic', utoken].join(" ")
                    }
                }).then(function(data, status) {
                    $log.info('Delete OK : data = ' + data);
                }).error(function(data, status) {
                    $log.error('Delete KO : Failed request status = ' + status + ' & data = ' + data);
                });
            } else {
                $log.error('UToken is missing');
            }
        } else {
            $log.error('Email is required');
        }
    };
}


// Dashboard controller
function DashboardCtrl($log, $scope, MCSDevices, $timeout, $cookieStore) {
    $scope.messages = [];
    $scope.serial = '2002';
    $scope.lastUpdate = new Date().getTime();

    $scope.userConnected = $cookieStore.get('utoken') || $cookieStore.get('dtoken');

    var counter = 0;
    $scope.loadMore = function() {
        var oldest = $scope.messages.length != 0 ? $scope.messages[$scope.messages.length - 1].when : null;

        MCSDevices.getMessagesBefore($scope.serial, oldest, 10).then(function(response){
            $log.info("within resolved resources", response.data);
            angular.forEach(response.data, function(value, key){
                $scope.messages.push(value);
            });
            $scope.lastUpdate = new Date().getTime();
        });
    }

    $scope.checkForNewMsg = function() {
        var newest = $scope.messages.length != 0 ? $scope.messages[0].when : null;

        MCSDevices.getMessagesAfter($scope.serial, newest, 10).then(function(response){
            angular.forEach(response.data.reverse(), function(item, value){
                jQuery.pnotify({
                    title: ''+new Date(item.when),
                    text: item.hr,
                    hide: false,
                    styling: 'bootstrap'
                });
                $scope.messages.splice(0,0,item);
            });
            $scope.lastUpdate = new Date().getTime();
        });
    }

    if ($scope.userConnected) {
        $scope.loadMore();
        $timeout(poll, 0);
    }

    function poll() {
        $scope.checkForNewMsg();
        $timeout(poll, 5000);
    }
}