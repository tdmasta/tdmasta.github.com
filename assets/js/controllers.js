'use strict';

/* Controllers */
function RegistrationCtrl($scope) {
    $scope.registrationSubmit = function(input) {
        alert(JSON.stringify(input));
    };
}

function TopListCtrl($scope, $http) {
    // $http.get('/assets/js/controllers.js').
    // $http.get('http://workflow.insgroup.fr/workflow/pv/gateways/overprod?currentstatus=OK&percent=100').
    // $http.get('http://briantford.com/blog/angular-d3.html').
    // $http.jsonp('http://api.ihackernews.com/page?format=jsonp&callback=JSON_CALLBACK').


    $http({
            method: 'GET',
            url: 'http://192.168.0.42:9010/security/authentication',
            params: {'email': $scope.account.email, 'password': $scope.account.email},
            headers: {'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
            }).
        success(function(data, status) {
            alert('++ OK : status = ' + status + ' et data = ' + data);
        }).
        error(function(data, status) {
            alert('++ KO - request failed - status = ' + status + ' et data = ' + data);
        });

/*
    $http.get('192.168.0.42:9010/security/authentication').
    192.168.0.42:9010/security/authentication
    /mcs/devices
        success(function(data, status) {
            $scope.posts = data;
            alert('>>> OK : status = ' + status + ' et data = ' + data);
        }).
        error(function(data, status) {
            alert('>>> KO - request failed - status = ' + status + ' et data = ' + data);
        });
*/
}