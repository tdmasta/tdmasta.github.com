'use strict';

/* Controllers */
function RegistrationCtrl($scope, $http) {
    $scope.registrationSubmit = function(input) {
        // 'POST' method without Authorization
        $http({
            method : 'POST',
            url : 'http://192.168.0.42:9010/mcs/register.json',
            data : $scope.account // $.param($scope.account)
            // ,headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data, status) {
            alert('OK : status = ' + status + ' & data = ' + data);
        }).error(function(data, status) {
            alert('KO - Request failed - status = ' + status + ' & data = ' + data);
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
                alert('OK : status = ' + status + ' & data = ' + data);
            }).error(function(data, status) {
                alert('KO - Request failed - status = ' + status + ' & data = ' + data);
            });
        */
    };
}
