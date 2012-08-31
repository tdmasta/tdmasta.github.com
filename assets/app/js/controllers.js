'use strict';

/* 
 * Controllers
*/

// Authentication controller
function AuthenticationCtrl($scope, $http, $log, $cookieStore, SecurityServices, SharedModuleServices) {

    // AuthenticationBySerialSubmit button
    $scope.authenticationBySerialSubmit = function() {

        if ($scope.account && $scope.account.inputSerial && $scope.account.inputKey) {
            // checkCRC service
            SecurityServices.checkCRC($scope.account.inputSerial, $scope.account.inputKey)
                .success(function(data, status) {
                    $log.info('checkCRC OK : data = ' + data);
                    $cookieStore.put('dtoken', data);
                    SharedModuleServices.prepareDisplayDashboard();
                })
                .error(function(data, status) {
                    $log.error('checkCRC KO : Failed request status = ' + status + ' & data = ' + data);
                    $cookieStore.put('dtoken', null);
                    SharedModuleServices.prepareHideDashboard();
                });
        }
    };

    // AuthenticationByEmailSubmit button
    $scope.authenticationByEmailSubmit = function() {
        alert('By Email Submit : ' + JSON.stringify($scope.account));
    };

}


// Registration controller
function RegistrationCtrl($scope, $http, $log, $cookieStore, CONSTANTS, SecurityServices) {

    // Registration button
    $scope.registrationSubmit = function() {
        var hosturl = CONSTANTS.remote;

        // registration service
        SecurityServices.registration($scope.account)
            .success(function(data, status) {
                $cookieStore.put('utoken', data);
                $log.info('Registration OK : utoken = ' + data);
            }).error(function(data, status) {
                $cookieStore.put('utoken', null);
                $log.error('Registration KO : Failed request status = ' + status + ' & data = ' + data);
            });
    };

    // Delete button
    $scope.deleteClick = function() {
        if ($scope.account && $scope.account.email) {
            var utoken = $cookieStore.get('utoken');
            if (utoken) {
                // delete account service
                SecurityServices.deleteAccount($scope.account.email)
                    .success(function(data, status) {
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
function DashboardCtrl($log, $scope, DevicesServices, $timeout, $cookieStore, SharedModuleServices) {
    $scope.$on('handleDisplayDashboard', function() {
        $scope.displayDashboard = SharedModuleServices.displayDashboard;
        $scope.loadMore();
        $timeout(poll, 0);
    });

    $scope.messages = [];
    $scope.serial = '2002';
    $scope.lastUpdate = new Date().getTime();

    var counter = 0;

    $scope.loadMore = function() {
        var oldest = $scope.messages.length != 0 ? $scope.messages[$scope.messages.length - 1].when : null;

        DevicesServices.getMessagesBefore($scope.serial, oldest, 10)
            .then(function(response){
                $log.info("within resolved resources", response.data);
                angular.forEach(response.data, function(value, key){
                    $scope.messages.push(value);
                });
                $scope.lastUpdate = new Date().getTime();
            });
    }

    $scope.checkForNewMsg = function() {
        var newest = $scope.messages.length != 0 ? $scope.messages[0].when : null;

        DevicesServices.getMessagesAfter($scope.serial, newest, 10)
            .then(function(response){
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

    if ($cookieStore.get('dtoken')) {
        $scope.loadMore();
        $timeout(poll, 0);
    }

    function poll() {
        $scope.checkForNewMsg();
        $timeout(poll, 5000);
    }
}
