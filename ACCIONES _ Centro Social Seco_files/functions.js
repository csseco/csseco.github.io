var g_allSettings   = null,
    postTimer       = null,
    gXHR            = null;

var log = function log(text) {
    if (window.console && window.console.log) {
        window.console.log(text);
    }
};
function getLocale(defaultLocale){
    var locale = Wix.Utils.getLocale() || defaultLocale;
    locale = (locale) ? locale.toLowerCase().replace(/[^a-zA-Z]+/g, "") : 'en';
    
    if(locale.length === 2) {
        return locale; 
    }
    
    return defaultLocale;
}
function ucfirst(str) {
    var text = str;
    var parts = text.split(' '),
        len = parts.length,
        i, words = [];
        
    for (i = 0; i < len; i++) {
        var part = parts[i];
        var first = part[0].toUpperCase();
        var rest = part.substring(1, part.length);
        var word = first + rest;
        words.push(word);

    }
    return words.join(' ');
};
var pad = function(num, totalChars) {
    var pad = '0';
    num = num + '';
    while (num.length < totalChars) {
        num = pad + num;
    }
    return num;
};
function checkURL(str) {
    var options =  {/*require_protocol:false*/};
    return validator.isURL(str,options);
}
function isIE(){
    //Test if the browser is IE
    var userAgent = window.navigator.userAgent.toLowerCase();
    return (/(msie|trident)/i.test(userAgent || ''));
}
function isSafari(){
    // Test if the browser is IE
    var userAgent = window.navigator.userAgent.toLowerCase();
    return (/(safari)/i.test(userAgent || ''));
}
function openPopup(url, width, height, title, scroller){
    var w       = width,
        h       = height,
        left    = (window.screen.width/2)-(w/2),
        top     = (window.screen.height/2)-(h/2);
    
    resizable = scroller  = (scroller) ? 'yes' : 'no';
    var win = window.open(url, "settingspopup", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars='+scroller+', resizable='+resizable+', copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    
    try{
        if (win!=null && win.moveTo) win.moveTo(left,top);
        if (win!=null) win.focus();
    }catch(e){ }
}
function canResize(){
    //return false;
    /*
    switch (Wix.Utils.getViewMode()) {
        case 'site':
        case 'preview': return false;
    }
    */
    return true;
}
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

/**
 * @name    wixHandlers
 * @params  none
 * @return  none
 * @desc    Listen to wix component deleted
 */
function wixHandlers(){
    if (Wix.Utils.getDemoMode()) return;
    Wix.addEventListener(Wix.Events.COMPONENT_DELETED,function(params){
        $.ajax({
            type: "DELETE",
            url: '/delete'+ document.location.search
        });
    });
    //onResizeWindow();
}
function adjustHeight(){
	var isMobile = (Wix.Utils.getDeviceType()==='mobile');
    $(window).ready(function(){
        setTimeout(function(){
            var height = getWinHeight();
            if(height) {
                console.log('height:',height);
                Wix.setHeight(height);
            }
        },0);
    });
}
function onResizeWindow(){
    resizeWindow();
    
    $(window).resizeend({
        delay: 600
    }, function() {
        resizeWindow();
    });
}
function resizeWindow(){
    if(!canResize()) return;
    adjustHeight();
}
function saveSettingsOnCloseSettingsWindow(){
    var key             = "settings_"+Wix.Utils.getCompId(),
        data            = localStorage.getItem(key),
        allSettings     = JSON.parse(data),
        searchString    = document.location.search + "&origCompId="+Wix.Utils.getCompId();
    
    if(allSettings){
        $.post('settings/save'+ searchString, allSettings , function(result){
            location.reload();            
        },'json');
        
        localStorage.removeItem(key);
    }
}
function setWidgetActionListener(){
    $(window).bind('storage', saveSettingsOnCloseSettingsWindow);
}

function getCookieKey(){
    return [Wix.Utils.getInstanceId(),Wix.Utils.getCompId()].join("_");
}
function postHive(description) {
    if(Wix.Utils.getViewMode() !== 'site') {
        log("Error: Invalid view mode. This function cannot be called in editor/preview mode. Supported view mode is: [site]");  
        return false; 
    }
    
    try{
        var activity =  {
            type: Wix.Activities.Type.CONVERSION_COMPLETE,
            info:  {
                conversionType: 'CTA_CLICK', 
                messageId: getCookieKey(),
                metadata:[{name:"Google Calendar App", value:description}]
            }
        };
        var onSuccess = function(d) {
            log("Success: Activity ID: " + d.activityId + ", Contact ID: " + d.contactId);
        };
        var onFailure = function(d) {
            log("Failure message:" + d);
        };
         
        Wix.Activities.postActivity(activity, onSuccess, onFailure);
    }catch(err){
        log("PostHive Error: ",err);
    }
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function strip_tags(input, allowed) {
    allowed = (((allowed || '') + '').toLowerCase() .match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  
    return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}