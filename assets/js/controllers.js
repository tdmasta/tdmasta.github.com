'use strict';

/* Controllers */
function RegistrationCtrl($scope) {
    $scope.registrationSubmit = function(input) {
        alert(JSON.stringify(input));
    };
}