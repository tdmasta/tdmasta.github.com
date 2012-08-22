'use strict';

/* Controllers */
function RegistrationCtrl($scope) {
    $scope.registrationSubmit = function(input) {
        alert(JSON.stringify(input));
    };
}

function TopListCtrl($scope, $http) {
    $http.jsonp('http://api.ihackernews.com/page?format=jsonp&callback=JSON_CALLBACK').
        success(function(data) {
            $scope.posts = data;
        }).
        error(function(data) {
            alert('Error during http.jsonp callback');
        })
}