'use strict';

/* Controllers */
function RegistrationCtrl($scope, $http) {
    $scope.registrationSubmit = function(input) {
        // $http.get('/assets/js/controllers.js').
        // $http.get('http://workflow.insgroup.fr/workflow/pv/gateways/overprod?currentstatus=OK&percent=100').
        // $http.get('http://briantford.com/blog/angular-d3.html').
        // $http.jsonp('http://api.ihackernews.com/page?format=jsonp&callback=JSON_CALLBACK').
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
    };
}
