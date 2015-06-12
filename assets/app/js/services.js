'use strict';


angular.module('NotificationModule', [], function($provide) {

	$provide.factory('Notif', function() {

		return {

			info: function(msg) {
				jQuery.pnotify({
                    title: 'Info',
                    text: msg,
					type: 'info',
                    hide: true,
                    styling: 'bootstrap'
                });
			},

			error: function(msg) {
				jQuery.pnotify({
                    title: 'Ooops',
                    text: msg,
					type: 'error',
                    hide: true,
                    styling: 'bootstrap'
                });
			},

			warn:  function(msg) {
				jQuery.pnotify({
                    title: 'Attention please',
                    text: msg,
					type: 'warning',
                    hide: true,
                    styling: 'bootstrap'
                });
			},

			success: function(msg) {
				jQuery.pnotify({
                    title: 'Hurray !',
                    text: msg,
					type: 'success',
                    hide: true,
                    styling: 'bootstrap'
                });
			}
		};
	});
});


//
// Module : DevicesModule
//
// Services : 
//      getMessagesBefore
//      getMessagesAfter
angular.module('DevicesModule', ['ngCookies']).factory('DevicesServices', function($http, $log, $cookieStore, CONSTANTS) {

    return {

        // getPacsFromIds method
        getPacsFromIds: function(dtoken, utoken) {
            if (null != dtoken) {
                // Device Dashboard Access
                return $http({
                    method : 'POST',
                    url : CONSTANTS.remote + '/iot/devices/pacs.csv',
                    data : { },
                    headers : {
                        'x-snsr-device-key' : dtoken
                    }
                });
            }
            if (null != utoken) {
                // Developer Dashboard Access
                return $http({
                    method : 'POST',
                    url : CONSTANTS.remote + '/iot/developers/pacs.csv',
                    data : { },
                    headers : {
                        Authorization : 'Basic ' + utoken
                    }
                });
            }
        },

        // getSfxMessagesBefore method
        getSfxMessagesBefore: function(before, amount) {
            var dtoken = $cookieStore.get('dtoken');
            var url = CONSTANTS.remote + '/iot/devices/msgs/sfx/history.json';
            $log.info('url built up', url);

            return $http({
                method : 'GET',
                url : url,
                params : {
                    before : before,
                    amount : amount
                },
                headers : {
                    'x-snsr-device-key' : dtoken
                }
            });
        },

        // getMessagesBefore method
        getMessagesBefore: function(before, amount) {
            var dtoken = $cookieStore.get('dtoken');
            var url = CONSTANTS.remote + '/iot/devices/msgs/history.json';
            $log.info('url built up', url);

			return $http({
                method : 'GET',
                url : url,
                params : {
                    until : before,
                    amount : amount
                },
                headers : {
                    'x-snsr-device-key' : dtoken
                }
            });
        },

        // getMessagesAfter method
		getMessagesAfter: function(after, amount) {
            var dtoken = $cookieStore.get('dtoken');
            var url = CONSTANTS.remote + '/iot/devices/msgs/recents.json';

			return $http({
                method : 'GET',
                url : url,
                params : {
                    after : after,
                    amount : amount
                },
                headers : {
                    'x-snsr-device-key' : dtoken
                }
            });
		},

        // clearDeviceMessages
        clearDeviceMessages : function() {
            var dtoken = $cookieStore.get('dtoken');
            var url = CONSTANTS.remote + '/iot/devices/clear.json';

            return $http({
                method : 'POST',
                url : url,
                data : { },
                headers : {
                    'x-snsr-device-key' : dtoken
                }
            });
        },

        // getChildren method
		getChildren : function() {
            var dtoken = $cookieStore.get('dtoken');
            var url = CONSTANTS.remote + '/iot/devices/children.json';
			return $http({
                method : 'GET',
                url : url,
                headers : {
                    'x-snsr-device-key' : dtoken
                }
            });
		} 
    };
});


//
// Module : SecurityModule
//
// Services : 
//      checkCRC
//      registration
//      authentication
//      deleteAccount
angular.module('SecurityModule', []).factory('SecurityServices', function(Base64, $http, $log, $cookieStore, CONSTANTS) {

    return {

		// Activate developper account
		activateAccount: function(uuid) {
			return $http({
				method : 'POST',
				url: CONSTANTS.remote + '/iot/developers/activatation/' + uuid
			});
		},

        // checkCRC method
        checkCRC : function(inputSerial, inputKey) {
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/devices/crc.json',
                params : {  
                    sn : inputSerial,
                    key : inputKey
                },
            });
        },

        // registration method
        registration: function(account) {
            var token = Base64.encode(account.email + ':' + account.password);
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/register.json',
                data : account,
                headers : {
                    Authorization : 'Basic ' +  token
                }
            });
        },

        // authentication method
        authentication: function(email, password) {
            $log.info('authentication : ' + email);
            var token = Base64.encode(email + ':' + password);
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/security/authentication',
                headers : {
                    Authorization : 'Basic ' +  token
                }
            });
        },

        // delete account method
        deleteAccount: function(email) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'DELETE',
                url : CONSTANTS.remote + '/iot/developers.json',
                params : {
                    email : email
                },
                headers : {
                    Authorization : 'Basic ' + utoken
                }
            });
        },

        // update password
        updatePassword: function(login, currentpwd, newpwd, confirmpwd) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/updatePassword.json',
                data : {
                    email : login,
                    currentpwd : currentpwd,
                    newpwd : newpwd,
                    confirmpwd : confirmpwd
                },
                headers : {
                    Authorization : 'Basic ' + utoken
                }
            });
        },

        // update git information
        updateGit: function(login, gitAlias) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/registerGit.json',
                data : {
                    email : login,
                    gitAlias : gitAlias
                },
                headers : {
                    Authorization : 'Basic ' + utoken
                }
            });
        }
    };
});


//
// Module : DeveloperModule
//
// Services : 
//      loadDevices
//      registration
//      authentication
//      deleteAccount
angular.module('DevelopersModule', []).factory('DevelopersServices', function($http, $log, $cookieStore, CONSTANTS) {

    return {

        // loadInformations method
        loadInformations : function() {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/developers.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                }
            });
        },

        // decode method
        decode: function(decoder) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/developers/decode',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {frame : decoder.frame, protocol : decoder.protocol},
            });            
        },

        // iotSimulation method
        iotSimulation: function(params) {
            var url = CONSTANTS.remote + '/iot/developers/simulator.json';
            var utoken = $cookieStore.get('utoken');
            $log.info('URL built up : ' + url + ' & params : ' + JSON.stringify(params));
            var promise = $http({
                method : 'POST',
                url : url,
                data : params,
                headers : {
                    Authorization : 'Basic ' + utoken
                }
            });
            return promise;
        },

        // loadDevices method
        loadDevices : function() {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/developers/modules.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
            });
        },

        // loadApplications method
        loadApplications : function() {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/developers/apps.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
            });
        },

        //Create a new application
        createApplication : function(application) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/apps.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
               	data : application,
            });
        },

        //Update an application
        updateApplication : function(application) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/apps.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
               	data : application,
            });
        },

        //delete an application
        deleteApplication : function(application) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'DELETE',
                url : CONSTANTS.remote + '/iot/developers/apps.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
               	params : {id : application.id},
            });
        },

        //Attach a module to an application
        attachModule : function(device, application) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/apps/'+application.id+'/modules/attach.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
               	data : device,
            });
        },

        //detach a module from an application
        detachModule : function(device, application) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/apps/'+application.id+'/modules/detach.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
               	data : device,
            });
        },

        //register a module
        registerModule : function(device) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/developers/modules.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
               	data : new Array(device),
            });
        },

        //unregister a module
        unregisterModule : function(device) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'DELETE',
                url : CONSTANTS.remote + '/iot/developers/modules.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {id : device.id, sn : device.serial},
            });
        },

        //get iot device
        getIotDevice : function(device) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/developers/device.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {id : device.id, sn : device.serial},
            });                
        },

        //update watched flag
        updateWatchedflag : function(device) {
            var utoken = $cookieStore.get('utoken');
            var flag = !device.watched;
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/devices/watch.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {id : device.id, sn : device.serial, value : flag},
            });                
        },

        //update active flag
        updateActiveflag : function(device) {
            var utoken = $cookieStore.get('utoken');
            var flag = !device.active;
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/devices/active.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {id : device.id, sn : device.serial, value : flag},
            });                
        },

        //update status
        updateStatus : function(device) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/devices/status.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {id : device.id, sn : device.serial, value : device.status},
            });                
        },

        //update bidirval
        updateBidirval : function(device) {
            var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'POST',
                url : CONSTANTS.remote + '/iot/devices/bidirval.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
                params : {id : device.id, sn : device.serial, value : device.bidirval},
            });                
        },

        //List modules of application
        findModules : function(appli) {
        	var utoken = $cookieStore.get('utoken');
            return $http({
                method : 'GET',
                url : CONSTANTS.remote + '/iot/developers/apps/'+appli.id+'/modules.json',
                headers : {
                    Authorization : 'Basic ' + utoken
                },
            });
        }
	};
});


//
// Module : ContextModule
//
// member :
//      state
// Services : 
//      DashboardVisibility toggle
//      SerialNumber setter
//      handleDisplayDashboardEvent
angular.module('Context', []).factory('Context', function($rootScope, $cookieStore, $log) {

    var state = {
		serial : undefined,
		dashboard : {
			visible: false
		}
	};

    state.setDashBoardVisibilty = function(flag) {
		this.dashboard.visible = flag;
        this.notify('DashBoardEvent');
    };

    state.setSerial = function(sn) {
		this.serial = sn;
        this.notify('newSerialEvent');
    };

    state.notify = function(event) {
		$log.info("triggering event", event);
        $rootScope.$broadcast(event);
    };
	
    return state;

});