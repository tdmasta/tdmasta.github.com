'use strict';

/* 
 * Controllers
*/

// Registration controller
function RegistrationCtrl($scope, $http) {

    // Registration button
    $scope.registrationSubmit = function() {
        // 'POST' method without Authorization
        $http({
            method : 'POST',
            url : 'http://192.168.0.42:9010/mcs/register.json',
            data : $scope.account
        }).success(function(data, status) {
            $cookieStore.put('mcstoken', data);
            console.log('Registration OK : token = ' + data);
            alert('Registration OK : token : ' + data);
        }).error(function(data, status) {
            console.log('Registration KO : Failed request status = ' + status + ' & data = ' + data);
            alert('Registration KO : Failed request status = ' + status + ' & data = ' + data);
        });

        /**
            // 'GET' method with Authorization
            $http({
                method : 'GET',
                url : 'http://192.168.0.7:9010/security/authentication',
                params : {
                    'account' : $scope.account
                },
                headers : {
                    'Authorization' : 'Basic Y2hyaXN0b3VpbGhlQGhvdG1haWwuZnI6cG9wb3BvcG8='
                }
            }).success(function(data, status) {
                console.log('Authentication OK : data = ' + data);
                alert('Authentication OK : data : ' + data);
            }).error(function(data, status) {
                console.log('Authentication KO : Failed request status = ' + status + ' & data = ' + data);
                alert('Authentication KO : Failed request status = ' + status + ' & data = ' + data);
            });
        */
    };

    // Delete button
    $scope.deleteClick = function() {
        if ($scope.account && $scope.account.email && $cookieStore.get('mcstoken')) {
            $http({
                method : 'DELETE',
                url : 'http://192.168.0.42:9010/mcs/developers.json',
                params : {
                    'email' : $scope.account.email
                },
                headers : {
                    'Authorization' : ['Basic', $scope.token].join(" ")
                }
            }).then(function(data, status) {
                console.log('Delete OK : data = ' + data);
                alert('Delete OK : data : ' + data);
            }).error(function(data, status) {
                console.log('Delete KO : Failed request status = ' + status + ' & data = ' + data);
                alert('Delete KO : Failed request status = ' + status + ' & data = ' + data);
            });
        } else {
            alert('No token or no email');
        }
    };
}

// Dashboard controller
function DashboardCtrl($log, $scope, MCSDevices) {
    $scope.items = [];

    var counter = 0;
    $scope.loadMore = function() {
		var msgs = MCSDevices.getMessages('2002',null,2);
    };

    $scope.loadMore();
}
