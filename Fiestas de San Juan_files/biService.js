'use strict';
(function() {
	angular.module(objParams.appName).service('biService', ['wixService',function(wixService) {
		var srcNum = 63,
		    self = this,
        publishSiteEvId = 201;
       
    var events = [
        ['clickOnCreateAccount' , 17, ['link_description','link_type','tab_name']],
        ['disconnect' , 17, ['link_description','link_type','tab_name']],
        ['clickOnConnectAccount' , 18, ['button_description','button_type','tab_name']],
        ['connected' , 102, ['old_status','new_status','type','tab_name']],
        ['settingsOpened', 110, ['state'] ], //state - first time"
        ['savePublish',publishSiteEvId,['wixlabs_bool_1','wixlabs_bool_2','wixlabs_bool_3','wixlabs_string_1','wixlabs_string_2','wixlabs_string_3','wixlabs_string_4','wixlabs_num_1', 'event_trigger']]
    ];
     
    var appIds = wixService.getAppIds();

	var superProperties = {
		Uid : wixService.Utils.getUid(),
		InstanceId : wixService.Utils.getInstanceId(),
		CompId : wixService.Utils.getCompId(),
		OrigCompId : wixService.Utils.getOrigCompId(),
		IsPremium : wixService.isPremium(),
		siteId : appIds.metaSiteId,
		visitorId : wixService.Utils.getInstanceValue('aid')
	};

	self.getCompId = function() {
		return (superProperties.CompId.indexOf("comp") > -1) ? superProperties.CompId : superProperties.OrigCompId;
	};

	self.getInstanceId = function() {
		return superProperties.InstanceId;
	};

	var frogSuperProperties = {
		app_id : objParams.appId,
		app_site_id : self.getInstanceId(),
		biToken : appIds.biToken,
		instance_id : self.getCompId(),
		uuid : superProperties.Uid
	};

	var onSuccessDef = function() {};
	var onErrorDef = function() {};
	self.noop = function() {};

	var report = function(params, bUserEvent, onSuccess, onError) {
		var url = bUserEvent ? '//frog.wix.com/wixlabs-ugc?' : '//frog.wix.com/wixlabs-users?',
		    cacheKiller = '_=' + new Date().getTime(),
		    bi = new Image();

		if ((params.evid === publishSiteEvId) || bUserEvent) {
			if (!bUserEvent) {
				delete params.origin;
			}
			delete params.market;
		}

		if (bUserEvent) {
			delete params.app_site_id;
			delete params.tab_name;
			delete params.site_id;
			delete params.uuid;

			params.comp_id = self.getCompId();
			params.instance_id = self.getInstanceId();
			params.visitor_id = superProperties.visitorId;
		}

		bi.onload = onSuccess || onSuccessDef;
		bi.onerror = onError || onErrorDef;

		var BIURL = url + cacheKiller + "&src=" + srcNum + "&" + Object.keys(params).map(function(key) {
			return [encodeURIComponent(key), "=", encodeURIComponent(params[key])].join("");
		}).join("&");

		if (bUserEvent && !wixService.isSiteMode()) {
			return;
		}
		//send user events only in site mode
		if (bUserEvent && !wixService.isSiteMode())
			return;
		bi.src = BIURL;
	};

	var eventClosure = function(eventParams, paramsOrder, sUserEvent) {
		return function() {
			var bUserEvent = (!!sUserEvent) && (sUserEvent === 'user'),
			    onSuccess = arguments[1] || self.noop,
			    onError = arguments[2] || self.noop,
			    params = arguments[0] || [];

			for (var i = 0; i < paramsOrder.length; i++) {
				eventParams[paramsOrder[i]] = params[i];
			}
			report(eventParams, bUserEvent, onSuccess, onError);
		};
	};

	self.init = function() {
		for (var i = 0; i < events.length; i++) {
			var event = events[i],
			    eventParams = $.extend({
				evid : event[1]
			}, frogSuperProperties);
			for (var j = 0; j < event[2]; j++) {
				event[2][j] = '';
			}
			self[event[0]] = eventClosure(eventParams, event[2], event[3]);
		}
	};

	self.init();
}]);
})();