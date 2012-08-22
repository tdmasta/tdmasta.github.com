'use strict';

/* Controllers */
function RegistrationCtrl($scope) {
    $scope.registrationSubmit = function(input) {
        alert(JSON.stringify(input));
    };
}

function TopListCtrl($scope, $http) {
/**
    $http.jsonp('http://api.ihackernews.com/page?format=jsonp&callback=JSON_CALLBACK').
        success(function(data) {
            $scope.posts = data;
        }).
        error(function(data) {
            alert('Error during http.jsonp callback');
        })
*/
$http.get('/assets/js/controllers.js').
// $http.get('http://workflow.insgroup.fr/workflow/pv/gateways/overprod?currentstatus=OK&percent=100').
// $http.get('http://briantford.com/blog/angular-d3.html').
// $http.jsonp('http://api.ihackernews.com/page?format=jsonp&callback=JSON_CALLBACK').
    success(function(data, status) {
        $scope.posts = data;
        alert('>>> OK : status = ' + status + ' et data = ' + data);
    }).
    error(function(data, status) {
        alert('>>> KO - request failed - status = ' + status + ' et data = ' + data);
    });
}