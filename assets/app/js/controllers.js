'use strict';

/* 
 * Controllers
*/

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

// Dashboard controller
function DashboardCtrl($log, $scope, MCSDevices) {
    $scope.messages = [];

    var counter = 0;
    $scope.loadMore = function() {
		var msgs = MCSDevices.getMessages('2002', null, 2);
		if (msgs) {
            var objs = angular.fromJson(msgs);
	        for (var i = 0; i < objs.length; i++) {
                $scope.messages.push(objs[i]);
                // $scope.messages.push({hr: objs[i].hr, raw: objs[i].raw});
            }
        }
    };

    $scope.loadMore();
}
