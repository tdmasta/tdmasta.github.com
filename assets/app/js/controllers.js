'use strict';

/* 
 * Controllers
*/

// Authentication controller
function authenticationCtrl($scope, $http, $log, $cookieStore, CONSTANTS) {

    // AuthenticationBySerialSubmit button
    $scope.authenticationBySerialSubmit = function() {
        alert('By Serial Submit : ' + JSON.stringify($scope.account));
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
            $cookieStore.put('mcstoken', data);
            $log.info('Registration OK : token = ' + data);
            alert('Registration OK : token : ' + data);
        }).error(function(data, status) {
            $log.error('Registration KO : Failed request status = ' + status + ' & data = ' + data);
            alert('Registration KO : Failed request status = ' + status + ' & data = ' + data);
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
                alert('Authentication OK : data : ' + data);
            }).error(function(data, status) {
                $log.error('Authentication KO : Failed request status = ' + status + ' & data = ' + data);
                alert('Authentication KO : Failed request status = ' + status + ' & data = ' + data);
            });
        */
    };

    // Delete button
    $scope.deleteClick = function() {
        if ($scope.account && $scope.account.email) {
            var mcstoken = $cookieStore.get('mcstoken');
            if (mcstoken) {
                var hosturl = CONSTANTS.remote;

                $http({
                    method : 'DELETE',
                    url : hosturl + '/mcs/developers.json',
                    params : {
                        'email' : $scope.account.email
                    },
                    headers : {
                        'Authorization' : ['Basic', mcstoken].join(" ")
                    }
                }).then(function(data, status) {
                    $log.info('Delete OK : data = ' + data);
                    alert('Delete OK : data : ' + data);
                }).error(function(data, status) {
                    $log.error('Delete KO : Failed request status = ' + status + ' & data = ' + data);
                    alert('Delete KO : Failed request status = ' + status + ' & data = ' + data);
                });
            } else {
                $log.error('MCSToken is missing');
                alert('MCSToken is missing');
            }
        } else {
            $log.error('Email is required');
            alert('Email is required');
        }
    };
}


// Dashboard modal controller
function DashboardModalCtrl($scope) {
    $scope.connectionPopupF = function(){
        $scope.connectionPopup = !$scope.connectionPopup;          
    };
}


// Dashboard controller
function DashboardCtrl($log, $scope, MCSDevices, $timeout) {
    $scope.messages = [];
    $scope.serial = '2002';
    $scope.lastUpdate = new Date().getTime();
    
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

    $scope.loadMore();

    function poll() {
        $scope.checkForNewMsg();
        $timeout(poll, 5000);
    }

    $timeout(poll, 0);
}