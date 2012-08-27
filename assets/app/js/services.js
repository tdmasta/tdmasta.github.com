'use strict';

angular.module('MCSDeviceServices', ['ngResource']).
	factory('MSCDevices',function($resource, token, id, until, amount){
		return $resource('/mcs/devices/msgs.json',{}, {
			query: {method:'GET', params:{'sn': sn, 'until': until, 'amount': amount}, isArray:true}
		});
	});