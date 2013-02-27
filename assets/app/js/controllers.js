'use strict';

/* 
 * Controllers
*/

// Authentication controller
function AuthenticationCtrl($scope, $http, $log, $cookieStore, SecurityServices, Context, Notif) {

    // AuthenticationBySerialSubmit button
    $scope.authenticationBySerialSubmit = function() {

        if ($scope.account && $scope.account.inputSerial && $scope.account.inputKey) {
            // checkCRC service
            SecurityServices.checkCRC($scope.account.inputSerial, $scope.account.inputKey)
                .success(function(data, status) {
                    $log.info('checkCRC OK : data = ' + data);
                    $cookieStore.put('dtoken', data);
                    Context.setSerial($scope.account.inputSerial);
                    Context.setDashBoardVisibilty(true);
                })
                .error(function(data, status) {
                    $log.error('checkCRC KO : Failed request status = ' + status + ' & data = ' + data);
                    $cookieStore.remove('dtoken');
                    $cookieStore.remove('utoken');
					Context.setSerial(undefined);
                    Context.setDashBoardVisibilty(false);
					Notif.error(data);
                });
        }
    };

    // AuthenticationByEmailSubmit button
    $scope.authenticationByEmailSubmit = function() {

        if ($scope.account && $scope.account.inputEmail && $scope.account.inputPassword) {
            // authentication service
            SecurityServices.authentication($scope.account.inputEmail, $scope.account.inputPassword)
                .success(function(data, status) {
                    $log.info('authentication OK : data = ' + data);
                    $cookieStore.put('utoken', data);

                    Context.setSerial(undefined);
                    Context.setDashBoardVisibilty(true);
                })
                .error(function(data, status) {
                    $log.error('authentication KO : Failed request status = ' + status);
                    $cookieStore.remove('dtoken');
                    $cookieStore.remove('utoken');

                    Context.setSerial(undefined);
                    Context.setDashBoardVisibilty(false);
                });
        }
    };
}


// iotSimulator controller
function iotSimulatorCtrl($scope, $http, $log, $cookieStore, CONSTANTS, DevicesServices, Context, Notif) {

    $scope.generatedmessages = [];

    $scope.typeMessagesSelect = [
        { name: 'Random', value: 'RANDOM' }, 
        { name: 'Battery low', value: 'BATTERY_LOW' }, 
        { name: 'Battery ok', value: 'BATTERY_OK' },
        { name: 'Connection lost', value: 'CONNECTION_LOST' },
        { name: 'Connection ok', value: 'CONNECTION_OK' },
        { name: 'Opening Detector close', value: 'OPENINGDETECTOR_CLOSE' },
        { name: 'Opening Detector open', value: 'OPENINGDETECTOR_OPEN' },
        { name: 'Button off', value: 'BUTTON_OFF' },
        { name: 'Button on', value: 'BUTTON_ON' },
        { name: 'Activity changing', value: 'ACTIVITY_CHANGING' },
        { name: 'Temperature changing', value: 'TEMPERATURE_CHANGING' },
        { name: 'Pressure changing', value: 'PRESSURE_CHANGING' },
        { name: 'Location changing', value: 'LOCATION_CHANGING' },
        { name: 'Battery changing', value: 'BATTERY_CHANGING' },
        { name: 'Emergency call', value: 'EMERGENCY_CALL' },
        { name: 'Beacon detection lost', value: 'BEACONDETECTION_LOST' },
        { name: 'Beacon detection ok', value: 'BEACONDETECTION_OK' },
        { name: 'Inductive carrier charger low', value: 'INDUCTIVECARRIERCHARGER_LOW' },
        { name: 'Inductive carrier charger ok', value: 'INDUCTIVECARRIERCHARGER_OK' },
        { name: 'Device disable', value: 'DEVICE_DISABLE' },
        { name: 'Device enable', value: 'DEVICE_ENABLE' }
    ];

    $scope.simulation = {
        url : 'http://',
        deviceserial : '9999',

        type : $scope.typeMessagesSelect[0].value,
        frequency : 5,
        hits : 0
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            $scope.$apply(function(){
                $scope.simulation.longitude = position.coords.longitude;
                $scope.simulation.latitude = position.coords.latitude;
            });
        });
    }

    var check = null;

    // reset button
    $scope.resetMessages = function() {
        $scope.generatedmessages = [];
        $scope.simulation.hits = 0;
    };

    // startStopSimulation button
    $scope.startStopSimulation = function() {
        if (! $('.generatebt').hasClass('active')) {
            if (check == null) {
                var cnt = 0;

                check = setInterval(function () {
                    DevicesServices.iotSimulation($scope.simulation)
                        .success(function(data, status){
                            $log.info("iotSimulation success & data => " + JSON.stringify(data));
                            $scope.generatedmessages.splice(0, 0, data);
                        })
                        .error(function(data, status){
                            $log.info("iotSimulation error & data => " + JSON.stringify(data) + " & status = " + status);
                        });
                    cnt++;
                    $scope.$apply(function(){
                        $scope.simulation.hits = cnt;
                    });
                }, $scope.simulation.frequency * 1000);
            }
            $('.generatebt').addClass($('.generatebt').attr('class-toggle'));
        } else {
            clearInterval(check);
            check = null;
            $scope.simulation.hits = '0';
            $('.generatebt').removeClass($('.generatebt').attr('class-toggle'));
        }
    };

    // Event handleDisplaySimulator
    $scope.$on('SimulatorEvent', function() {
        $log.info('waking up on simulator event');
        $scope.displaySimulator = Context.simulator.visible;
    });
}


// Registration controller
function RegistrationCtrl($scope, $http, $log, $cookieStore, CONSTANTS, SecurityServices, Notif) {

    // Registration button
    $scope.registrationSubmit = function() {
        var hosturl = CONSTANTS.remote;

        // registration service
        SecurityServices.registration($scope.account)
            .success(function(data, status) {
                $cookieStore.put('utoken', data);
                $log.info('Registration OK : utoken = ' + data);
				Notif.success('A confirmation email has been sent to the registered email adress, checkout your mbox');
            }).error(function(data, status) {
                $cookieStore.remove('utoken');
                $log.error('Registration KO : Failed request status = ' + status + ' & data = ' + data);
				Notif.error(data);
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
				Notif.error('User token missing, please check parameters');
                $log.error('UToken is missing');
            }
        } else {
			Notif.error('User email is required, please check parameters');
            $log.error('Email is required');
        }
    };
}


// Dashboard controller
function DashboardCtrl($log, $scope, DevicesServices, $timeout, $cookieStore, Context, Notif) {

    $scope.messages = [];
    $scope.lastUpdate = new Date().getTime();
	$scope.timer = undefined;
	$scope.serial = undefined;

    // loadMore    
    $scope.loadMore = function() {
        var oldest = $scope.messages.length != 0 ? $scope.messages[$scope.messages.length - 1].when : null;

        DevicesServices.getMessagesBefore(Context.serial, oldest, 50)
            .then(function(response){
                $log.info("within resolved resources", response.data);
                angular.forEach(response.data, function(value, key){
                    $scope.messages.push(value);
                });
                $scope.lastUpdate = new Date().getTime();
            });
    }

    // checkForNewMsg
    $scope.checkForNewMsg = function() {
        var newest = $scope.messages.length != 0 ? $scope.messages[0].when : null;

        DevicesServices.getMessagesAfter(Context.serial, newest, 50)
            .then(function(response){
                angular.forEach(response.data.reverse(), function(item, value){
                    jQuery.pnotify({
                        title: ''+new Date(item.when),
                        text: item.hr,
                        hide: false,
						type: 'info',
                        styling: 'bootstrap'
                    });
                    $scope.messages.splice(0, 0, item);
                });
                $scope.lastUpdate = new Date().getTime();
            });
    }

    $scope.poll = function() {
        $scope.checkForNewMsg();
       	$scope.timer = $timeout($scope.poll, 5000);
    }

    // Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope.displayDashboard = Context.dashboard.visible;
		if (true == $scope.displayDashboard) {
        	$scope.loadMore();	
			if (undefined == $scope.timer) {
				$log.info("calling polling operation");
				$scope.poll();
			} else {
				$log.info("not calling polling operation");
			}
		} else {
			clearInterval($scope.timer);
		}
    });

    // Event handleDisplayDashboard
    $scope.$on('newSerialEvent', function() {
        $scope.serial = Context.serial;
    });
}

function LogOutCtrl($scope, $log, $cookieStore, Context, Notif) {
	
	$scope.display = false;
	$scope.serial = undefined;
	
	$scope.logOut = function() {
		$cookieStore.remove('dtoken');
		$cookieStore.remove('utoken');
		Context.setSerial(undefined);
        Context.setDashBoardVisibilty(false);
		Notif.info('See you Soon');
	}
	
	// Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope.display = Context.dashboard.visible;
        $scope.serial = Context.serial;
    });
	
	
}