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
		}
	})
});

//
// Module : DevicesModule
//
// Services : 
//      getMessagesBefore
//      getMessagesAfter
angular.module('DevicesModule', ['ngCookies']).factory('DevicesServices', function($http, $log, $cookieStore, CONSTANTS) {

        return {

            // getMessagesBefore method
            getMessagesBefore: function(sn, before, amount) {
                var dtoken = $cookieStore.get('dtoken');
                var url = CONSTANTS.remote + '/iot/devices/msgs/history.json';
                $log.info('url built up', url);

				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        sn : sn,
                        until : before,
                        amount : amount
                    },
                    headers : {
                        'x-snsr-device-key' : dtoken
                    }
                });
            },

            // getMessagesAfter method
			getMessagesAfter: function(sn, after, amount) {
                var dtoken = $cookieStore.get('dtoken');
                var url = CONSTANTS.remote + '/iot/devices/msgs/recents.json';

				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        sn : sn,
                        after : after,
                        amount : amount
                    },
                    headers : {
                        'x-snsr-device-key' : dtoken
                    }
                });
			},
			
			getChildren : function(sn) {
                var dtoken = $cookieStore.get('dtoken');
                var url = CONSTANTS.remote + '/iot/devices/children.json';
				return $http({
                    method : 'GET',
                    url : url,
                    params : {
                        sn : sn
                    },
                    headers : {
                        'x-snsr-device-key' : dtoken
                    }
                });
			} 
        }
    });



//
// Module : SecurityModule
//
// Services : 
//      checkCRC
//      registration
//      authentication
//      deleteAccount
angular.module('SecurityModule', []).factory('SecurityServices', function($http, $log, $cookieStore, CONSTANTS) {

    return {

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
                return $http({
                    method : 'POST',
                    url : CONSTANTS.remote + '/iot/developers/register.json',
                    data : account
                });
            },

            // authentication method
            authentication: function(email, password) {
                $log.info('authentication : ' + email);
                return $http({
                    method : 'GET',
                    url : CONSTANTS.remote + '/security/authentication',
                    params : {
                        login : email,
                        pwd : password
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
        }
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
		}
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
	}

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