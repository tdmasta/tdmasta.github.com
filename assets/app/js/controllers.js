'use strict';

/* 
 * Controllers
*/

// Authentication controller
function AuthenticationCtrl(Base64, $scope, $http, $log, $cookieStore, $location, $window, $timeout, SecurityServices, Context, Notif) {
	$http.defaults.useXDomain = true;

	var uuid = $location.search().uuid;
	$scope.loginUnauthorized = false;
	if (uuid) {
		Notif.info("Processing account activation");
		$scope.loginUnauthorized = true;
		SecurityServices.activateAccount(uuid)
			.success(function(data, status) {
				Notif.info("Your account has been activated. You can authenticate you.");
				$scope.loginUnauthorized = false;
				// to remove #?uuid=... from url
				// wait 500 ms for the user have time to read success notif
				$timeout(function() {
						$window.location.href = "/dashboards/developer.html" ;
					},
					500);
			})
			.error(function(data, status) {
				$scope.loginUnauthorized = true;
				Notif.error("Error during account activation. Please retry later.");
			});
	}
	
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
		var email = $scope.inputEmail;
		var password = $scope.inputPassword;
        if (email && password) {
            // authentication service
            SecurityServices.authentication(email, password)
                .success(function(data, status) {
                    data = Base64.encode(email+":"+password);
                    $log.info('authentication OK : data = ' + data);
                    $cookieStore.put('utoken', data);
                    $cookieStore.put('login', email);

                    Context.setSerial(undefined);
                    Context.setDashBoardVisibilty(true);
                })
                .error(function(data, status) {
                    $log.error('authentication KO : Failed request status = ' + status);
                    $cookieStore.remove('dtoken');
                    $cookieStore.remove('utoken');
                    $cookieStore.remove('login'); 

                    Context.setSerial(undefined);
                    Context.setDashBoardVisibilty(false);
                    Notif.error('Invalid login / password combination, please check and try again');
                });
        }
    };
}


// Registration controller
function RegistrationCtrl($scope, $http, $log, $cookieStore, CONSTANTS, SecurityServices, Context, Notif) {

    $scope.$on('event:serverError', function(event){
        Notif.error(status);
    });

    // Registration button
    $scope.registrationSubmit = function() {
        var hosturl = CONSTANTS.remote;
        if ($scope.account) {
            if ($scope.account.password && $scope.account.repassword) {
                if ($scope.account.repassword != $scope.account.password) {
                    Notif.error('Passwords do not match, please double check');
                    return;
                }
            } else {
                    Notif.error('Password information is missing, please double check');
                    return;
            }
        }
        // registration service
        SecurityServices.registration($scope.account)
            .success(function(data, status) {
                //$cookieStore.put('utoken', data);
                $cookieStore.put('login', $scope.account.email);
                $log.info('Registration OK : utoken = ' + data);
				Notif.success('A confirmation email has been sent to the registered email adress, checkout your mbox');
            }).error(function(data, status) {
                $cookieStore.remove('utoken');
                $log.error('Registration KO : Failed request status = ' + status + ' et data = ' + data);
            });
    };

    // Delete button
    $scope.deleteClick = function() {
        if ($cookieStore.get('login')) {
            var utoken = $cookieStore.get('utoken');
            if (utoken) {
                var result = confirm("Do you really want to delete your account ?");
                if (result == true) {
                    // delete account service
                    SecurityServices.deleteAccount($cookieStore.get('login'))
                        .success(function(data, status) {
                            $log.info('Delete OK : data = ' + data);
                            $log.info('logout event');
                            $cookieStore.remove('dtoken');
                            $cookieStore.remove('utoken');
                            $cookieStore.remove('login');
                            //desactivation du polling
                            $scope._stopPolling = true; 
                            Context.setSerial(undefined);
                            Context.setDashBoardVisibilty(false);
                        }).error(function(data, status) {
                            $log.error('Delete KO : Failed request status = ' + status + ' & data = ' + data);
                        });
                }
            } else {
				Notif.error('User token missing, please check parameters');
                $log.error('UToken is missing');
            }
        } else {
			Notif.error('User email is required, please check parameters');
            $log.error('Email is required');
        }
    };

    // Change password button
    $scope.changePasswordClick = function() {
        SecurityServices.updatePassword($cookieStore.get('login'), $scope.account.currentpassword, $scope.account.newpassword, $scope.account.confirmpassword)
            .success(function(data, status) {
                $log.info('updatePassword OK : data = ' + data);

                // clean up
                $scope._stopPolling = true;
                $scope.account.currentpassword = '';
                $scope.account.newpassword = '';
                $scope.account.confirmpassword = '';
                $cookieStore.remove('dtoken');
                $cookieStore.remove('utoken');
                $cookieStore.remove('login');
                Context.setSerial(undefined);
                Context.setDashBoardVisibilty(false);
                Notif.success('Password changed ! Please reconnect.');
            })
            .error(function(data, status) {
                $log.error('updatePassword KO : Failed request status = ' + status + ' & data = ' + data);
                Notif.error('Error during Password changing : ' + data);
            });
    };
    
    // Update git
    $scope.updateGit = function() {
        $log.info('register git ('+$scope.account.gitid+') for '+$cookieStore.get('login'));
        SecurityServices.updateGit($cookieStore.get('login'), $scope.account.gitid)
            .success(function(data, status) {
                $log.info('git OK : data = ' + data);
                Notif.success('GitHub registration done');
            })
            .error(function(data, status) {
                $log.error('git KO : Failed request status = ' + status + ' & data = ' + data);
                Notif.error('Error during GitHub registration : ' + data);
            });
    };

}


// Dashboard controller
function DashboardCtrl($log, $scope, DevicesServices, $timeout, $cookieStore, Context, Notif) {

    $scope._messages = [];
    $scope._lastUpdate = new Date().getTime();
	$scope._timer = undefined;
	$scope._serial = undefined;
	$scope._stopPolling = false;
	$scope._errors = [];
	$scope._devicesMap = {};
	$scope._devices =0;
	
	$scope._eventTitle = {
		'event' : 'Nouvel Evènement',
		'service' : 'Demande de service',
		'raw' : 'Payload simple',
		'data' : 'Stockage de données',
		'register' : 'Nouvel Appairage',
		'keepalive' : 'KeepAlive',
		'undefined' : 'Inconnu'
	};
	
	$scope._eventDetail = {
		'batterylow' : 'Batterie Faible',
		'batteryok' : 'Batterie OK',
		'boot' : 'Redémarrage',
		'switchon' : 'Switch On',
		'switchoff' : 'Switch Off',
		'rssilow' : 'Qualité signal faible',
		'rssiok' : 'Qualité signal OK',
		'connectionlost' : 'Réseau local KO',
		'connectionok' : 'Réseau local OK',
		'tweet' : "Envoi d 'un tweet",
		'keepalive' : 'Keepalive',
		'register' : 'Nouveau matériel Détecté',
		'temphigh' : 'Il fait beau et chaud',
		'templow' : 'Température Faible',
		'tempok' : 'Température OK',
		'undefined' : ''
	};
	

	$scope.mySorter = function()  {
		return function(object) {
			return object.value.idx;
		};
	};

    //Clear device messages
    $scope.clearDeviceMessages = function() {
        $log.info('clearDeviceMessages');
        var result = confirm("Want to clear ALL emitted messages from your device ?");
        if (result==true) {
            DevicesServices.clearDeviceMessages()
                .then(function(response) {
                    switch (response.status) {
                        case 200 :
                            $log.info("clearDeviceMessages ok");
                            Context.setDashBoardVisibilty(true);
                            $scope._messages = [];
                            break;
                        default :
                            $log.error('Unexpexted error', response.status, response.body);
                            Notif.error("Unexpexcted error, please check with tech support team.");
                    }
                });
        }
    };

    // loadMore    
    $scope.loadMore = function() {
        var oldest = $scope._messages.length != 0 ? $scope._messages[$scope._messages.length - 1].when : null;

        DevicesServices.getMessagesBefore(oldest, 20)
            .then(function(response) {
				switch (response.status) {
					case 200 :
	                	$log.info("within resolved resources", response);
	                	angular.forEach(response.data.items, function(value, key){
	                    	$scope._messages.push(value);
	                	});
	                	$scope._lastUpdate = new Date().getTime();
						if ($scope._messages[0] && $scope._messages[0].ctxt) {
							var device = $scope._messages[0].ctxt;
							var delta = $scope._messages[0].contrib;
							$scope._devicesMap[device.id] = $scope.merge(device,delta);
						};
					break;
					case 404 :
						Notif.error("Resource not found, please check with tech support team.");
						break;
					default :
						$log.error('Unexpexted error', response.status, response.body);
						Notif.error("Unexpexcted Error");
						break;
				}
			});
    };
	
	$scope.merge = function(obj1, obj2) {
	    var obj3 = {};
	    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	    return obj3;
	};

    // checkForNewMsg
    $scope.checkForNewMsg = function() {
        var newest = $scope._messages.length != 0 ? $scope._messages[0].when : null;
        var dtoken = $cookieStore.get('dtoken');
		if(undefined != dtoken)
	        DevicesServices.getMessagesAfter(newest, 20)
	            .then(function(response) {
					$log.info('response', response.data);
					switch (response.status) {
						case 200 :
							if (typeof response.data != "undefined") {
								
				                angular.forEach(response.data.items.reverse(), function(item, value) {
									var infos = item.type.split(':');
									
									var ititle = function() {
										return $scope._eventTitle[infos[0] || 'undefined'];
									};
									
									var itext = [$scope._eventDetail[infos[1] || 'undefined'], item.payload || ''].join(' ');
									
				                    jQuery.pnotify({
				                        title: ititle,
				                        text: itext,
				                        hide: false,
										type: 'info',
				                        styling: 'bootstrap'
				                    });
				                    $scope._messages.splice(0, 0, item);
				                });
				
								if (response.data.items.length != 0 && $scope._messages[0].ctxt)  {
									var device = $scope._messages[0].ctxt;
									var delta  = $scope._messages[0].contrib;
									$scope._devicesMap[device.id] = $scope.merge(device,delta);
								}
							}
			                $scope._timer = new Date().getTime();
							break;
						case 404 :
							Notif.error("Resource not found, please check with tech support team.");
							break;
						default :
							$log.error('Unexpexted error', response.status, response.body);
							Notif.error("Unexpexcted Error");
							break;
					}
	            });
    };

    $scope.poll = function() {
		if (undefined == Context.serial) {
			$log.info('Stopping polling');
			clearInterval($scope._timer);
		} else {
	        $scope.checkForNewMsg();
			$scope._timer = $timeout($scope.poll, 5000);
		}
   };

	$scope.init = function() {
		return DevicesServices.getChildren();
	};

	$scope.$on('event:loginRequired', function(event){
		$scope._stopPolling = true;
		
		if ($scope._errors.length == 0) {
			Notif.error("Authentication failure => leaving");
			$scope._errors.push();
		} else {
			$scope._errors.pop();
		}
        $cookieStore.remove('dtoken');
        $cookieStore.remove('utoken');
		Context.setSerial(undefined);
        Context.setDashBoardVisibilty(false);
	});

	$scope.$on('event:serverError', function(event){
		Notif.error(data);
	});

    // Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope._displayDashboard = Context.dashboard.visible;

        $cookieStore.remove('utoken');

        if (typeof $scope._timer !== 'undefined' ) {
            clearInterval($scope._timer);
        }

		if (true == $scope._displayDashboard) {

			$scope.init().then(function(response) {

                $log.info("_devicesMap : ", $scope._devicesMap);

                $scope._devicesMap = {};

				angular.forEach(response.data, function(device) {
					$log.info("handling device ", device);
					$scope._devicesMap[device.id] = device;
				});

				$scope._devices = response.data.length;

				$log.info("_devices",$scope._devices);
	        	$scope.loadMore();
	            
    			$log.info("calling polling operation");
    			$scope.poll();
			});
		}
    });

    // Event handleDisplayDashboard
    $scope.$on('newSerialEvent', function() {
        $scope._serial = Context.serial;
    });

    // is geolocorgps frame
    $scope.isgeolocorgps = function (extra) {

        if (extra === undefined || extra === null || extra === '') {
            return false;
        }

        var messagetype = extra.type;

        if (messagetype === 'data_geoloc' || messagetype === 'data_gps') {

            var latitude = extra.latitude;
            var longitude = extra.longitude;

            if (latitude === undefined || latitude === null || latitude === '' || longitude === undefined || longitude === null || longitude === '') {
                return false;
            }

            return true;

        }

        return false;
    };

}

function LogOutCtrl($scope, $log, $cookieStore, $window, Context, Notif, DevicesServices) {
	
	$scope._display = false;
	$scope._serial = undefined;

	$scope.logOut = function() {
		$log.info('logout event');
		$cookieStore.remove('dtoken');
		$cookieStore.remove('utoken');
		//desactivation du polling
		$scope._stopPolling = true;
		Context.setDashBoardVisibilty(false);
		Context.setSerial(undefined);

        $window.location.reload();

		Notif.info('See you Soon');
	};

    // getPacsFromId
    $scope.getPacsFromId = function() {
        $log.info('getPacsFromId click');
        var dtoken = $cookieStore.get('dtoken');
        var utoken = $cookieStore.get('utoken');
        if(undefined != dtoken) {
            DevicesServices.getPacsFromIds(dtoken, null)
                .success(function(data, status) {
                    $log.info('getPacsFromIds OK');
                    window.location.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
                })
                .error(function(data, status) {
                    $log.error('getPacsFromIds KO');
                });
        } else {
            if(undefined != utoken) {
                DevicesServices.getPacsFromIds(null, utoken)
                    .success(function(data, status) {
                        $log.info('getPacsFromIds OK');
                        window.location.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
                    })
                    .error(function(data, status) {
                        $log.error('getPacsFromIds KO');
                    });
            }
        }
    };

	// Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope._display = Context.dashboard.visible;
        $scope._serial = Context.serial;
    });
	
}


// printvalue used to see rangevalue
function printRangeValue(sliderid, textbox, suffix) {
    var x = document.getElementById(textbox);
    var y = document.getElementById(sliderid);
    if (null != x && null != y) {
        x.value = y.value + ' ' + suffix;
    }
}


// url validation
function isValidUrl(urlSource){

    if (urlSource === undefined || urlSource === null || urlSource === '') {
        return false;
    }

    urlSource = urlSource.toLowerCase();

    if (urlSource === "http://" || urlSource === "https://"){
        return false;
    }

    // Source : https://gist.github.com/dperini/729294
    var regexp = /^(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/

    return regexp.test(urlSource);
}


// Open a google map on latlng point
function openmap(latlng) {
    window.open("https://maps.google.fr/maps?hl=fr&q="+latlng+"&z=15&output=embed","Position : " + latlng,"menubar=no, status=no, scrollbars=no, menubar=no, width=500, height=400");
}


// Validate a password : Passwords must contain at least six characters, including uppercase, lowercase letters and numbers.
function validatePassword() {
    var currentpassword = document.getElementById("currentpassword").value;
    var newpassword = document.getElementById("newpassword").value;
    var confirmpassword = document.getElementById("confirmpassword").value;

    document.getElementById("currentpassword").setCustomValidity('');  //empty string means no validation error
    document.getElementById("newpassword").setCustomValidity('');  //empty string means no validation error
    document.getElementById("confirmpassword").setCustomValidity('');  //empty string means no validation error
    document.getElementById("changeButtonId").removeAttribute("disabled");

    if(newpassword != confirmpassword) {
        document.getElementById("confirmpassword").setCustomValidity("Passwords Don't Match");
        document.getElementById("changeButtonId").setAttribute("disabled", "disabled");
        return;
    }

    if(isEmptyOrBlank(currentpassword)) {
        document.getElementById("currentpassword").setCustomValidity("Current Password is null or empty");
        document.getElementById("changeButtonId").setAttribute("disabled", "disabled");
        return;
    }

    if(isEmptyOrBlank(newpassword)) {
        document.getElementById("newpassword").setCustomValidity("New Password is null");
        document.getElementById("confirmpassword").setCustomValidity("New Password is null");
        document.getElementById("changeButtonId").setAttribute("disabled", "disabled");
        return;
    }

    if (! passwordStrategy(newpassword)) {
        document.getElementById("newpassword").setCustomValidity("Incorrect Password");
        document.getElementById("confirmpassword").setCustomValidity("Incorrect Password");
        document.getElementById("changeButtonId").setAttribute("disabled", "disabled");
        return;
    }

    document.getElementById("currentpassword").setCustomValidity('');  //empty string means no validation error
    document.getElementById("newpassword").setCustomValidity('');  //empty string means no validation error
    document.getElementById("confirmpassword").setCustomValidity('');  //empty string means no validation error
}


function isEmptyOrBlank(str) {
    return (!str || 0 === str.length || /^\s*$/.test(str));
}


function passwordStrategy(str) {
     if (str.length < 6) {
         return false;
     }
     var re = /[0-9]/;
     if (!re.test(str)) {
         return false;
     }
     re = /[a-z]/;
     if (!re.test(str)) {
         return false;
     }
     re = /[A-Z]/;
     if (!re.test(str)) {
         return false;
     }
     return true;
}


// Dashboard controller
function DeveloperDashboardCtrl($log,$location, $scope, DevelopersServices, $timeout, $cookieStore, Context, Notif, $filter, ngTableParams) {

	$scope.navType = 'pills';
	$scope.login = $cookieStore.get('login');
    $scope._messages = [];
    $scope._lastUpdate = new Date().getTime();
	$scope._errors = [];
	$scope.tableApps = new ngTableParams({
		page: 1, // show first page
		total: 0, // length of data
		count: 10, // count per page
		sorting: {
			name: 'asc' // initial sorting
		}
	});
	$scope.tableDevices = new ngTableParams({
		page: 1, // show first page
		total: 5, // length of data
		count: 10, // count per page
		sorting: {
			id: 'asc' // initial sorting
		}
	});

    $scope.generatedmessages = [];

    $scope.decodedmessages = [];

    $scope.udmProtocolSelect = [
        { name: 'UDM 2.2', value: 'UDM22' }, 
        { name: 'UDM 2.3', value: 'UDM23' }
    ];

    $scope.decoder = {
        frame : '010000',
        protocol : $scope.udmProtocolSelect[0].value
    };

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
        url : 'http://mysysteminformation:port',
        deviceserial : '9999',
        longitude : -0.6564933,
        latitude : 44.7824736,
        type : $scope.typeMessagesSelect[0].value,
        frequency : 5,
        hits : 0
    };

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
                    DevelopersServices.iotSimulation($scope.simulation)
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

    // decode button
    $scope.decode = function() {
        $scope.decodedmessages = [];
        DevelopersServices.decode($scope.decoder)
            .success(function(data, status){
                $log.info("decoder success & data => " + JSON.stringify(data));
                if (data != undefined && data.msg != undefined && data.msg.extra != undefined) {
                    for ( var i in data.msg.extra) {
                        $scope.decodedmessages.push(i + ' : ' + data.msg.extra[i]);
                    }
                } else {
                    $scope.decodedmessages.push('Error : Invalid Frame');
                }
            })
            .error(function(data, status){
                $log.info("decoder error & data => " + JSON.stringify(data) + " & status = " + status);
            });
    };

    //load Informations
    $scope.loadInformations = function() {
        $log.info('loadInformations');
        DevelopersServices.loadInformations().then(function(response) {
            $log.info("informations loaded", response.data);
            $scope.account = {
                email : response.data.customer.email,
                firstname : response.data.customer.firstname,
                lastname : response.data.customer.lastname,
                gitid : response.data.customer.gitAlias,
                token : $cookieStore.get('utoken')
            };
        });
    };
            
        
	//load Devices	
	$scope.loadDevices = function() {
		$log.info('loadDevices');
		DevelopersServices.loadDevices().then(function(response) {
			// set new data
			$scope.devicesList = response.data;
	 		$log.info("devices loaded", $scope.devicesList);
			// update table params
			$scope.tableDevices.total = $scope.devicesList.length;
	 		$log.info("nb devices loaded", $scope.tableDevices.total);
	 	});
	};

	//load Applications	
	$scope.loadApplications = function() {
		$log.info('loadApplications');

        $cookieStore.remove('dtoken');

        var utoken = $cookieStore.get('utoken');        

        if (undefined != utoken) {
    		DevelopersServices.loadApplications().then(function(response) {
    			// set new data
    			$scope.appsList = response.data;
    	 		$log.info("apps loaded", $scope.appsList);
    			// update table params
    			$scope.tableApps.total = $scope.appsList.length;
    	 		$log.info("nb apps loaded", $scope.tableApps.total);
    	 	});
        }
	};

    //load Simulator 
    $scope.loadSimulator = function() {
        printRangeValue('frequency','frequencyvalue', ' sec');
    };

    // Device edition
    $scope.editDeviceDetails=function(device) {
        $log.info('editDeviceDetails : ', device);
        $scope.device=device;

        DevelopersServices.getIotDevice(device).then(function(response) {
            $log.info("In getIotDevice with response : ", response.data);
            $scope.device.lastseen=response.data.lastseen;
            $scope.device.status=response.data.status;
            $scope.device.active=response.data.active;
            $scope.device.watched=response.data.watched;
            $scope.device.bidirval=response.data.bidirval;
        });

        $('.editDeviceModal').modal('show');
    };

    $scope.cancelEditDeviceModal=function() {
        $log.info('cancelEditDeviceModal : ', $scope.device);
        $('.editDeviceModal').modal('hide');
    };

    $scope.saveStatusEditDeviceModal=function() {
        $log.info('saveStatusEditDeviceModal : ', $scope.device);
        DevelopersServices.updateStatus($scope.device).then(function(response) {
            $log.info("SaveStatusEditDeviceModal Ok");
            Notif.info("Status Updated");
        });
        $('.editDeviceModal').modal('hide');
    };
    $scope.saveActiveEditDeviceModal=function() {
        $log.info('saveActiveEditDeviceModal : ', $scope.device);
        DevelopersServices.updateActiveflag($scope.device).then(function(response) {
            $log.info("saveActiveEditDeviceModal Ok");
            Notif.info("Active Flag Updated");
        });
        $('.editDeviceModal').modal('hide');
    };
    $scope.saveWatchedEditDeviceModal=function() {
        $log.info('saveWatchedEditDeviceModal : ', $scope.device);
        DevelopersServices.updateWatchedflag($scope.device).then(function(response) {
            $log.info("saveWatchedEditDeviceModal Ok");
            Notif.info("Watched Flag Updated");
        });
        $('.editDeviceModal').modal('hide');
    };
    $scope.saveBidirvalEditDeviceModal=function() {
        $log.info('saveBidirvalEditDeviceModal : ', $scope.device);
        DevelopersServices.updateBidirval($scope.device).then(function(response) {
            $log.info("saveBidirvalEditDeviceModal Ok");
            Notif.info("Bidir Value Updated");
        });
        $('.editDeviceModal').modal('hide');
    };

    // Device declaration
	$scope.showDeviceDetails=function(device) {
		$log.info('showDeviceDetails', device);
		$scope.device=device;
		$('.deviceModal').modal('show');
	};

	$scope.cancelDevice=function() {
		$log.info('cancelDevice', $scope.device);
		$('.deviceModal').modal('hide');
	};

	$scope.saveDevice=function() {
		$log.info('saveDevice', $scope.device);
		
		if($scope.device.serial!=undefined && $scope.device.key!=undefined) {
			$log.info('saveDevice => call server');
			DevelopersServices.registerModule($scope.device).then(function(response) {
				var result = response.data;
				$log.info('saveDevice', result);
				if(result.registered.length != 0) {
					$scope.loadDevices();
					$('.deviceModal').modal('hide');
				} 
				if(result.not_found.length != 0) {
					Notif.error("Module not found");
				} 
				if(result.already_registered.length != 0) {
					Notif.error("Module already registered");
				} 
				if(result.invalid_key.length != 0) {
					Notif.error("Module key is invalid");
				} 
			});
		} else {
			Notif.error("Mandatory field forgotten");
		}
	};

    $scope.unregisterModule=function(device, $index) {
        $log.info('unregisterModule : ', device, ' & index : ', $index);
        var result = confirm("Want to unregister device '" + device.serial + "' and detach it from applications ?");
        if (result == true) {
            DevelopersServices.unregisterModule(device).then(function(response) {
                $scope.loadDevices();
            });
        }
    };

	//Application Gestion
	$scope.deleteAppli=function(appli, $index, $event) {
		$event.stopPropagation();
		$log.info('deleteAppli', appli);
		var result = confirm("Want to delete the application named '"+appli.name+"'?");
		if (result==true) {	
			DevelopersServices.deleteApplication(appli).then(function(response) {
				$scope.appsList.splice($index, 1);
			});
		}
	};

	$scope.showAppliDetails=function(appli, $index) {
		$log.info('showAppliDetails', appli);
		$scope.appli=JSON.parse(JSON.stringify(appli));
		$scope.appli.$index=$index;
		$scope.appli.modules=[];
		if($scope.appli.id != undefined) {
			DevelopersServices.findModules(appli).then(function(response){
				$scope.appli.modules=response.data;
				$scope.appli.availablesModules=new Array().concat($scope.devicesList);
				for (var i = $scope.appli.availablesModules.length - 1; i >= 0; i--){
					for (var j=0; j < $scope.appli.modules.length; j++) {
						if($scope.appli.availablesModules[i] && $scope.appli.modules[j].serial == $scope.appli.availablesModules[i].serial) {
						  	 $scope.appli.availablesModules.splice(i,1);
						  	 $log.info('netoyage liste ', $scope.appli.availablesModules);
						}
					  
					};
				};
			});
		} else {
			$scope.appli.modules=[];
			$scope.appli.availablesModules=new Array().concat($scope.devicesList);
		}
		$('.appModal').modal('show');
	};
	
	$scope.saveAppli=function() {
	    var isvalidurl = isValidUrl($scope.appli.callbackurl);
		if($scope.appli.name != undefined && $scope.appli.callbackurl != undefined && isvalidurl) {
			if($scope.appli.id != undefined) {
				$log.info('updateAppli', $scope.appli);
				DevelopersServices.updateApplication($scope.appli).then(function(response) {
					$scope.appsList.splice($scope.appli.$index, 1,$scope.appli);
					$scope.attach($scope.appli);
			 	});
			} else {
				$log.info('createAppli', $scope.appli);
				DevelopersServices.createApplication($scope.appli).then(function(response) {
					$scope.appsList.push(response.data);
					$scope.attach(response.data);
			 	});
			}
			$('.appModal').modal('hide');
		} else {
			Notif.error("Application detail is incorrect");
		}
	};
	
	$scope.attach = function(appli) {
		$log.info('attach',appli);
		var modules = new Object();
		modules.serials = new Array();
		for (var i=0; i < $scope.appli.modules.length; i++) {
		  	if ($scope.appli.modules[i].attach == true) {
		  		modules.serials.push($scope.appli.modules[i].serial);
		  	}
		};
		$log.info('attachModules',modules);
		DevelopersServices.attachModule(modules, appli);
		modules.serials = new Array();
		for (var i=0; i < $scope.appli.availablesModules.length; i++) {
			var module = $scope.appli.availablesModules[i];
		  	if (module.detach == true) {
		  		modules.serials.push(module.serial);
		  	}
		};
		$log.info('detachModules',modules);
		DevelopersServices.detachModule(modules, appli);
	};
	
	$scope.cancelAppli=function() {
		$log.info('cancelAppli', $scope.appli);
		$('.appModal').modal('hide');
	};
	
	$scope.$on('event:serverError', function(event){
		Notif.error(data);
	});

    // Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope._displayDashboard = Context.dashboard.visible;
        $scope.login = $cookieStore.get('login');
        if($scope._displayDashboard == true) {
			$scope.loadApplications();
			$scope.loadDevices();
		}
    });
    
    // watch for changes of parameters
	$scope.$watch('tableApps', function(params) {
		if($scope._displayDashboard == true) {
			// ajax request to api
			$log.info("watch tableApps");
			var orderedData = params.sorting ? $filter('orderBy')($scope.appsList, params.orderBy()) : $scope.appsList;
			$scope.appsList = orderedData.slice( (params.page - 1) * params.count, params.page * params.count );
		}
	}, true);

    // watch for changes of parameters
	$scope.$watch('tableDevices', function(params) {
		if($scope._displayDashboard == true) {
			$log.info("watch tableDevices");
			$scope.devicesList = $scope.devicesList.slice( (params.page - 1) * params.count, params.page * params.count );
		}
	}, true);

    $scope.toggleDetach = function (item, index) {
    	$log.info("toggleDetach",item);
    	if(item.attach==true) {
    		item.attach=false;
    	}
    	item.detach=true;
        $scope.appli.availablesModules.push(item);
        $scope.appli.modules.splice(index, 1);
    };
    $scope.toggleAttach = function (item, index) {
    	$log.info("toggleAttach",item);
    	if(item.detach==true) {
    		item.detach=false;
    	}
    	item.attach=true;
        $scope.appli.modules.push(item);
        $scope.appli.availablesModules.splice(index, 1);
    };
}