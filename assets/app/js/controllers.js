'use strict';

/* 
 * Controllers
*/

// Authentication controller
function AuthenticationCtrl($scope, $http, $log, $cookieStore, SecurityServices, Context, Notif) {
	$http.defaults.useXDomain = true;
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
    $scope.authenticationByEmailSubmit = function(email, password) {

        if (email && password) {
            // authentication service
            SecurityServices.authentication(email, password)
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
				// Notif.success('A confirmation email has been sent to the registered email adress, checkout your mbox');
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
	

	$scope.mySorter = function() {
		return function(object) {
			return object.value.idx;
		}
	}
	
    // loadMore    
    $scope.loadMore = function() {
        var oldest = $scope._messages.length != 0 ? $scope._messages[$scope._messages.length - 1].when : null;

        DevicesServices.getMessagesBefore(Context.serial, oldest, 50)
            .then(function(response) {
				switch (response.status) {
					case 200 :
	                	$log.info("within resolved resources", response);
	                	angular.forEach(response.data, function(value, key){
	                    	$scope._messages.push(value);
	                	});
	                	$scope._lastUpdate = new Date().getTime();
						if ($scope._messages[0].ctxt) {
							var device = $scope._messages[0].ctxt;
							var delta = $scope._messages[0].contrib;
							$scope._devicesMap[device.id] = $scope.merge(device,delta);
						}
					break;
					case 404 :
						Notif.error("Resource not found, please check with tech support team.");
					default :
						$log.error('Unexpexted error', response.status, response.body);
						Notif.error("Unexpexcted Error");
				}
			});
    }
	
	$scope.merge = function(obj1, obj2) {
	    var obj3 = {};
	    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	    return obj3;
	}

    // checkForNewMsg
    $scope.checkForNewMsg = function() {
        var newest = $scope._messages.length != 0 ? $scope._messages[0].when : null;
        var dtoken = $cookieStore.get('dtoken');
		if(undefined != dtoken)
	        DevicesServices.getMessagesAfter(Context.serial, newest, 50)
	            .then(function(response) {
					$log.info('response', response.data);
					switch (response.status) {
						case 200 :
							if (typeof response.data != "undefined") {
								
				                angular.forEach(response.data.reverse(), function(item, value) {
									var infos = item.type.split(':')
									
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
				
								if (response.data.length != 0 && $scope._messages[0].ctxt)  {
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
    }

    $scope.poll = function() {
		if (undefined == Context.serial) {
			$log.info('Stopping polling');
			clearInterval($scope._timer);
		} else {
	        $scope.checkForNewMsg()
			$scope._timer = $timeout($scope.poll, 5000);
		}
    }

	$scope.init = function() {
		return DevicesServices.getChildren(Context.serial);
	}

	$scope.$on('event:loginRequired', function(event){
		$scope._stopPolling = true;
		
		if ($scope._errors.length == 0) {
			Notif.error("Authentication failure => leaving");
			$scope._errors.push()
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
        
		if (true == $scope._displayDashboard) {
			
			$scope.init().then(function(response) {
				$scope._devices=0;
				angular.forEach(response.data,function(device) {
					$log.info("handling device ", device);
					$scope._devicesMap[device.id] = device;
					$scope._devices = $scope._devices + 1;
				});
				$log.info("_devices",$scope._devices);
	        	$scope.loadMore();
	
				if (undefined == $scope._timer) {
					$log.info("calling polling operation");
					$scope.poll();
				} else {
					$log.info("not calling polling operation");
				}
			});
		} else {
			clearInterval($scope._timer);
		}
    });

    // Event handleDisplayDashboard
    $scope.$on('newSerialEvent', function() {
        $scope._serial = Context.serial;
    });
}

function LogOutCtrl($scope, $log, $cookieStore, Context, Notif) {
	
	$scope._display = false;
	$scope._serial = undefined;
	
	$scope.logOut = function() {
		$log.info('logout event');
		$cookieStore.remove('dtoken');
		$cookieStore.remove('utoken');
		//desactivation du polling
		$scope._stopPolling = true;
		Context.setSerial(undefined);
        Context.setDashBoardVisibilty(false);
		Notif.info('See you Soon');
	}
	
	// Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope._display = Context.dashboard.visible;
        $scope._serial = Context.serial;
    });
	
}

// Dashboard controller
function DeveloperDashboardCtrl($log,$location, $scope, DevelopersServices, $timeout, $cookieStore, Context, Notif,$filter, ngTableParams) {


	$scope.navType = 'pills';
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

	//load Devices	
	$scope.loadDevices = function() {
		$log.info('loadDevices');
		DevelopersServices.loadDevices().then(function(response) {
			// set new data
			$scope.devicesList = response.data;
	 		$log.info("devices loaded",$scope.devicesList);
			// update table params
			$scope.tableDevices.total = $scope.devicesList.length;
	 		$log.info("nb apps loaded",$scope.tableDevices.total);
	 	});
	}
	//load Applications	
	$scope.loadApplications = function() {
		$log.info('loadApplications');
		DevelopersServices.loadApplications().then(function(response) {
			// set new data
			$scope.appsList = response.data;
	 		$log.info("apps loaded",$scope.appsList);
			// update table params
			$scope.tableApps.total = $scope.appsList.length;
	 		$log.info("nb apps loaded",$scope.tableApps.total);
	 	});
	}
	
	$scope.showDeviceDetails=function(device) {
		$log.info('showDeviceDetails', device);
		$scope.device=device;
		$('.deviceModal').modal('show');
	}
	$scope.cancelDevice=function() {
		$log.info('cancelDevice', $scope.device);
		$('.deviceModal').modal('hide');
	}
	$scope.saveDevice=function() {
		$log.info('saveDevice', $scope.device);
		
		if($scope.device.serial!=undefined && $scope.device.key!=undefined) {
			$log.info('saveDevice => call server');
			DevelopersServices.registerModule($scope.device).then(function(response) {
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
	}
	//Application Gestion
	$scope.deleteAppli=function(appli, $index, $event) {
		$event.stopPropagation();
		$log.info('deleteAppli', appli);
		var result = confirm("Want to delete the application named '"+appli.name+"'?");
		if (result==true) {	
			DevelopersServices.deleteApplication(appli).then(function(response) {
				$scope.appsList.splice($index, 1);
			});
		}
	}
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
	}
	
	$scope.saveAppli=function() {
		if($scope.appli.name != undefined && $scope.appli.callbackurl != undefined) {
			if($scope.appli.id != undefined) {
				$log.info('updateAppli', $scope.appli);
				DevelopersServices.updateApplication($scope.appli).then(function(response) {
					$scope.appsList.splice($scope.appli.$index, 1,$scope.appli);
					$scope.attach($scope.appli);
			 	});
			} else {
				$log.info('createAppli', $scope.appli);
				DevelopersServices.createApplication($scope.appli).then(function(response) {
					$scope.appsList.push(response.data);
					$scope.attach(response.data);
			 	});
			}
			$('.appModal').modal('hide');
		} else {
			Notif.error("Apllication detail is incomplete");
		}
	}
	
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
	}
	
	$scope.cancelAppli=function() {
		$log.info('cancelAppli', $scope.appli);
		$('.appModal').modal('hide');
	}
	
	$scope.$on('event:serverError', function(event){
		Notif.error(data);
	});

    // Event handleDisplayDashboard
    $scope.$on('DashBoardEvent', function() {
		$log.info('waking up on dashoard event');
        $scope._displayDashboard = Context.dashboard.visible;
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
			 $scope.appsList = $scope.appsList.slice(
			(params.page - 1) * params.count,
			params.page * params.count
			);
		}
	}, true);
    // watch for changes of parameters
	$scope.$watch('tableDevices', function(params) {
		if($scope._displayDashboard == true) {
			$log.info("watch tableDevices");
			 $scope.devicesList = $scope.devicesList.slice(
			(params.page - 1) * params.count,
			params.page * params.count
			);
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
