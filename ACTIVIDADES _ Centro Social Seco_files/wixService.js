'use strict';
(function () {
    function Wix($window, $location, $timeout) {
        var wix = $window.Wix;
        var url = $location.absUrl();

        wix.getParamFromURL = function (name) {
            var val;
            try {
                val = new URLSearchParams($window.location.search).get(name);
            } catch (err) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec($window.location.search);

                val = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            }

            return val;
        };

        wix.myNavigateTo = function (link) {
            link = JSON.parse(link.replace(/\~#~/g, '"'));
            return wix.navigateTo(link);
        };

        wix.Utils.getInstance = function () {
            var instanceRegexp = /.*instance=([\[\]a-zA-Z0-9\.\-_]*?)(&|$|#).*/g;
            var instance = instanceRegexp.exec(url);

            return (instance && instance[1]) ? instance[1] : undefined;
        };

        wix.isMobile = function () {
            return (wix.Utils.getDeviceType() == "mobile");
        };

        wix.isEditorMode = function () {
            return (wix.Utils.getViewMode() == "editor");
        };

        wix.isSiteMode = function () {
            return (wix.Utils.getViewMode() == "site");
        };

        wix.isPreviewMode = function () {
            return (wix.Utils.getViewMode() == "preview");
        };

        var myKey = 'mobileResize2';
        wix.getDataValue = function (cbOK, cbError) {
            wix.Data.Public.get(myKey, {scope: 'COMPONENT'}, cbOK, cbError);
        };

        wix.setDataValue = function (data, cbOK, cbError) {
            if (!wix.isEditorMode()) {
                //cbError; 
                return;
            }
            wix.Data.Public.set(myKey, data, {scope: 'COMPONENT'}, cbOK, cbError);
        };

        wix.isIOS = function () {
            var userAgent = navigator.userAgent.toLowerCase(),
                isIPhone = (userAgent.indexOf("iphone") >= 0),
                isIPod = (userAgent.indexOf("ipod") >= 0),
                isIPad = (userAgent.indexOf("ipad") >= 0);

            return (isIPhone || isIPod || isIPad);
        };

        wix.isIE = function () {
            //Test if the browser is IE
            var userAgent = window.navigator.userAgent.toLowerCase();
            return (/(msie|trident)/i.test(userAgent || ''));
        };

        wix.isSafari = function () {
            // Test if the browser is IE
            var userAgent = window.navigator.userAgent.toLowerCase();
            return (/(safari)/i.test(userAgent || ''));
        };

        wix.isIPhone = function () {
            var userAgent = navigator.userAgent.toLowerCase(),
                isIPhone = (userAgent.indexOf("iphone") >= 0);

            return (isIPhone);
        };

        wix.isIpad = function () {
            var userAgent = navigator.userAgent.toLowerCase(),
                isIPad = (userAgent.indexOf("ipad") >= 0);

            return (isIPad);
        };

        wix.isPremium = function () {
            return false;
        };

        wix.getAppIds = function () {
            var instanceId = wix.Utils.getInstanceId();
            var biToken = wix.Utils.getInstanceValue('biToken') || '';
            var metaSiteId = wix.Utils.getInstanceValue('metaSiteId') || '';
            var obj = {"instanceId": instanceId, "metaSiteId": metaSiteId, "biToken": biToken};
            return obj;
        };

        wix.getCookieKey = function (keyName) {
            var compId = wix.Utils.getOrigCompId() || wix.Utils.getCompId();
            var cookieKey = [keyName, wix.Utils.getInstanceId(), compId].join("_");
            return cookieKey;
        };

        return wix;
    }

    Wix.$inject = ["$window", "$location", "$timeout"];
    angular.module(objParams.appName).service('wixService', Wix);
})();