angular.module(objParams.appName)
.filter('https', function() {
    return function(input) {
        input = input || '';
        out = input.replace("http://","https://");
        return out;
    };
  
}).filter('html', ['$sce', function ($sce) { 
    return function (text) {
        return $sce.trustAsHtml(text);
    };
        
}]).filter('capitalize', function() {
    return function(input, all) {
        var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
        return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    };
    
}).filter('htmlEscape',function(){
    return function(s){
        var str = (s + '').replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#039;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br />');
       return str; 
    };
    
 }).filter('urlToLink',function(){
    return function(str) {
        /**
         * replaces any urls in the text to html links
         * @param text
         * @return {*}
         */
   
        if (!/href\=/i.test(str)) {        
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return str.replace(exp, '<a href="javascript:void(0)" onclick="return openPopup(\'$1\',800,800)">$1</a>');              
        }
        
        var $div    = $('<div>').html(str);
        var $links  = $div.find('a');
        var exp     = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        
        $links.each(function(index,elm){
            var $elm = $(elm);
            var href = $elm.attr('href').trim();
            if (!exp.test(href) && href.indexOf('//')!=0) href = "//"+href;
            $elm.attr('onclick',"return openPopup(\'"+href+"',800,800)");
            $elm.attr('href',"javascript:void(0)");         
        });
        
        var result  = $div.html();      
        return result;
    };
    
 }).filter('getEventById',function(){
    return function(eventUniqeId) {
        var keepGoing = true;
        
        var event = angular.element('#calendar').fullCalendar('clientEvents' , function(event) {
            if ( (event.uniqeId == eventUniqeId)  && keepGoing) {
                //console.log('second:', event.id, event.start);
                keepGoing = false;
                return event;
            }
        });

        return event[0] || '';
    };
    
 }).filter('timeStringToFloat',function(){
    return function(time) {
        var hoursMinutes    = time.split(/[.:]/);
        var hours           = parseInt(hoursMinutes[0], 10);
        var minutes         = Math.min(59,hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0);
        var result          = hours + minutes / 60;
        
        return result;
    };
}).filter('linkGoogleShare',function($filter){
    return function(event) {
        
        var title           = event.name || event.title || $filter('translate')('event_no_title'),
            description     = angular.isUndefined(event.description ) ? '': event.description,
            location        = angular.isUndefined(event.location) ?  '': event.location,
            iso_from_date   = event.start.utc().format().replace("+00:00","").replace(/[^\dT]/g,"").substring(0,15)+"Z",
            iso_to_date     = event.end.utc().format().replace("+00:00","").replace(/[^\dT]/g,"").substring(0,15)+"Z";
        
        if(event.allDay) {
        	iso_from_date   =  iso_from_date.substring(0,8);
        	iso_to_date   	=  iso_to_date.substring(0,8);
        }
        
        var url = '&text='+escape(title);
        
        url  += '&dates='+iso_from_date+'/'+iso_to_date;
        url  += (description !== "") ? '&details='+escape((description).substring(0,600)) : "";
        url  += (location !== "") ? '&location='+escape(location) : "";
        
        url   = (isMobile()) 
                ? window.location.protocol+'//calendar.google.com/calendar/gp#~calendar:view=e&bm=1&action=TEMPLATE'+url+'&trp=false'
                : window.location.protocol+'//www.google.com/calendar/event?action=TEMPLATE'+url+'&trp=false';    
            
        return url;
    };    
    
}).filter('timeWithClock',function(){
    return function(time) {
        var svgClock = '<svg xml:space="preserve" enable-background="new 0 0 15.75 16.25" viewBox="0 0 15.75 16.25" height="16.25px" width="15.75px" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" class="svg-time"> <g>     <path d="M7.875,14.75c-3.584,0-6.5-2.916-6.5-6.5s2.916-6.5,6.5-6.5s6.5,2.916,6.5,6.5S11.459,14.75,7.875,14.75z M7.875,3.335     c-2.71,0-4.915,2.205-4.915,4.915s2.205,4.915,4.915,4.915S12.79,10.96,12.79,8.25S10.585,3.335,7.875,3.335z" class="svg-clock"/> </g> <g>     <path d="M7.786,9.232l-2.76-2.925c-0.24-0.255-0.229-0.656,0.026-0.897c0.255-0.24,0.656-0.229,0.897,0.026l2.251,2.386    l2.771-0.685c0.339-0.084,0.684,0.123,0.768,0.463s-0.123,0.684-0.463,0.768L7.786,9.232z" class="svg-clock"/> </g> </svg>' + 
         ' ' + time;
        return svgClock; 
    };
    
}).filter('nextIcon',function(){
    return function() {
        var arrow = '<span><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="8" height="11" viewBox="0 0 8 11" id="Layer_1" xml:space="preserve"><metadata id="metadata9"><rdf:RDF><cc:Work about=""><dc:format>image/svg+xml</dc:format><dc:type resource="http://purl.org/dc/dcmitype/StillImage"></dc:type><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs7"></defs>'+
                        '<polygon class="svg_arrow" points="0.875,6.25 8.875,0.75 8.875,11.75 " transform="matrix(-1,0,0,1,8.875,-0.75)" id="polygon3" style="fill:#666666"></polygon>'+
                    '</svg></span>';
        return arrow; 
    };
    
}).filter('prevIcon',function(){
    return function() {
        var arrow = '<span><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="8" height="11" viewBox="0 0 8 11" id="Layer_1" xml:space="preserve"><metadata id="metadata9"><rdf:RDF><cc:Work about=""><dc:format>image/svg+xml</dc:format><dc:type resource="http://purl.org/dc/dcmitype/StillImage"></dc:type><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs7"></defs>'+
                        '<polygon class="svg_arrow" points="8.875,0.75 8.875,11.75 0.875,6.25 " transform="translate(-0.875,-0.75)" id="polygon3" style="fill:#666666"></polygon>'+
                    '</svg></span>';
        return arrow; 
    };
        
}).filter('viewMoreText',function(){
    return function(text) {
        var arrow = '<svg class="nav-arrow-more" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" id="Layer_1" x="0px" y="0px" viewBox="0 0 18 11" enable-background="new 0 0 18 11" xml:space="preserve"> <polygon class="svg_arrow" transform="rotate(-180, 9, 5.5)" fill="#A864A8" points="0,11 9,0 18,11 "></polygon> </svg>';
        text =  '<div>' + text + arrow +'</div>'; 
        return text; 
    };
  
 }).filter('viewLessText',function(){
    return function(text) {
        var arrow = '<svg class="nav-arrow-less" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" id="Layer_1" x="0px" y="0px" viewBox="0 0 18 11" enable-background="new 0 0 18 11" xml:space="preserve"> <polygon class="svg_arrow" fill="#A864A8" points="0,11 9,0 18,11 "></polygon> </svg>';
        text  =  '<div>' + text + arrow +'</div>';
        return text; 
    };
 
 }).filter('timeToText',function(){
     return function(textFormat,event, lang, isEnd) {
        /*if(isMobile()){
            var tz = getCalendarTimezone();
            event.start = event.start.clone().tz(tz);
            event.end   = (event.end) ? event.end.clone().tz(tz) : event.start.clone();
        }else{
            event.end   = (event.end) ? event.end.clone() : event.start.clone();
        }*/
        //console.log(event.start.clone());
        
        event.end   = (event.end) ? event.end.clone() : event.start.clone();
        
        function isStartSameYear(){
            return ((new Date()).getFullYear() === Number(event.start.format('YYYY')));
        }
        
        function isEndSameYear(){
           return ((new Date()).getFullYear() === Number(eventEnd.format('YYYY')));
        }
        
        var lang        = lang,
            is24h       = Boolean(getTimeFormat()) ,
            isShort     = Boolean(isShortDayName()),
            nextDay     = event.end.clone().subtract(1),
            eventStart  = (event.start === undefined) ? event : event.start,
            eventEnd    = (event.end === undefined) ? event : event.end,
            type,
            args;
            
        me = {
            Title: function (type) {
                var me = {
                    Hour: function () {
                        var formatStart = '',
                            formatEnd   = '';
                         
                        if(is24h) {
                            formatStart = eventStart.format('HH:mm') ;
                            formatEnd   = eventEnd.format('HH:mm');
                        }else{
                            switch (lang) {
                                case 'ko':  formatEnd   = (eventEnd) ? (Number(eventEnd.format('m')) === 0 ? 
                                                          eventEnd.format('Ah시') : eventEnd.format('Ah시mm분')) : formatStart;
                                            break;
                                            
                                default:    formatStart = eventStart.format('h:mma');
                                            formatEnd   = (eventEnd) ?  eventEnd.format('h:mma') :  formatStart;
                            }
                        }
                        
                        formatStart += (isEnd) ? '-' + formatEnd : '';
                        return formatStart;
                        
                    },
                    Day: function () {
                        switch (lang) {
                            case 'en':  return (isShort) ? eventStart.format('ddd, MMM D, YYYY') : eventStart.format('dddd, MMMM D, YYYY');
                            case 'ja':  return eventStart.format('YYYY年 M月 D日 dddd');
                            case 'ko':  return eventStart.format('YYYY년 M월 D일 dddd');
                            case 'es':  return (isShort) ? eventStart.format('ddd, D [de] MMM, YYYY') : eventStart.format('dddd, D [de] MMMM, YYYY');
                            default:    return (isShort) ? eventStart.format('ddd, MMM D, YYYY') : eventStart.format('dddd, MMMM D, YYYY');
                        }
                    },
                    Month: function () {
                        switch (lang) {
                            case 'en':  return (isShort) ? eventStart.format('MMM YYYY') : eventStart.format('MMMM YYYY');
                            case 'ja':  return eventStart.format('YYYY年 M月');
                            case 'ko':  return eventStart.format('YYYY년 M월');
                            default:    return (isShort) ? eventStart.format('MMM YYYY') : eventStart.format('MMMM YYYY');
                        }
                    },
                    Period: function () {
                        var me = {
                            SameMonth: function () {
                                switch (lang) {
                                    case 'en':  return (isShort) ?
                                                eventStart.format('MMM D')  + ' - ' + nextDay.format('D, YYYY') :
                                                eventStart.format('MMMM D') + ' - ' + nextDay.format('D, YYYY');
                                                
                                    case 'ja':  return eventStart.format('YYYY年 M月 D日') + ' - ' + nextDay.format('D日');
                                    
                                    case 'ko':  return eventStart.format('YYYY년 M월 D일') + ' - ' + nextDay.format('D일');
                                    
                                    default:    return  (isShort) ? 
                                                eventStart.format('MMM D') + ' - ' + nextDay.format('D, YYYY') : 
                                                eventStart.format('MMMM D') + ' - ' + nextDay.format('D, YYYY');
                                }
                            },
                            SameYear: function () {
                                switch (lang) {
                                    case 'en':  return (isShort) ?
                                                eventStart.format('MMM D')     + ' - ' + nextDay.format('MMM D, YYYY') : 
                                                eventStart.format('MMMM D')    + ' - ' + nextDay.format('MMMM D, YYYY');
                                                
                                    case 'ja':  return eventStart.format('YYYY年 M月 D日') + ' - ' + nextDay.format('M月 D日');
                                    
                                    case 'ko':  return eventStart.format('YYYY년 M월 D일') + ' - ' + nextDay.format('M월 D일');
                                    
                                    case 'es':  return (isShort) ? 
                                                eventStart.format('D [de] MMM')  + ' - '  + nextDay.format('D [de] MMM, YYYY'):
                                                eventStart.format('D [de] MMMM') + ' - '  + nextDay.format('D [de] MMMM, YYYY');
                                                
                                    default:    return (isShort) ?
                                                eventStart.format('MMM D')     + ' - ' + nextDay.format('MMM D, YYYY') :
                                                eventStart.format('MMMM D')    + ' - ' + nextDay.format('MMMM D, YYYY');
                                }
                            },
                            Other: function () {
                                switch (lang) {
                                    case 'en':  return (isShort) ? 
                                                eventStart.format('MMM D, YYYY') + ' - ' + nextDay.format('MMM D, YYYY') : 
                                                eventStart.format('MMMM D, YYYY') + ' - ' + nextDay.format('MMMM D, YYYY');
                                                
                                    case 'ja':  return eventStart.format('YYYY年 M月 D日') + ' - ' + nextDay.format('YYYY年 M月 D日');
                                    
                                    case 'ko':  return eventStart.format('YYYY년 M월 D일') + ' - ' + nextDay.format('YYYY년 M월 D일');
                                    
                                    case 'es':  return (isShort) ? 
                                                eventStart.format('D [de] MMM, YYYY') + ' - ' + nextDay.format('D [de] MMM, YYYY') : 
                                                eventStart.format('D [de] MMMM, YYYY') + ' - ' + nextDay.format('D [de] MMMM, YYYY');
                                                
                                    default:    return (isShort) ? 
                                                eventStart.format('MMM D, YYYY') + ' - ' + nextDay.format('MMM D, YYYY') :
                                                eventStart.format('MMMM D, YYYY') + ' - ' + nextDay.format('MMMM D, YYYY');
                                }
                            }
                        };

                        if (eventStart.format('YYYYMM') === event.end.format('YYYYMM')) { 
                            return me.SameMonth();
                        } else if (eventStart.format('YYYY') === event.end.format('YYYY')) {
                            return me.SameYear();
                        } else {
                            return me.Other();
                        }
                    }
                };

                if (typeof me[type] === 'function') {
                    return me[type].call(this);
                }
            },
            Description: function () {
                var me = {
                    AllDay: function () {
                        var me = {
                            Day: function () {
                                switch (lang) {
                                    case 'en':  return eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY')));
                                                
                                    case 'ja':  return (isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ')) +
                                                eventStart.format('M月 D日 ddd');
                                                
                                    case 'ko':  return (isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ')) +
                                                eventStart.format('M월 D일 dddd');
                                                
                                    case 'es':  return eventStart.format('ddd, D [de] MMMM') +
                                                (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY')));
                                                
                                    default:    return eventStart.format('ddd, MMMM D') +
                                                (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY')));
                                }
                            },
                            Other: function () {
                                switch (lang) {
                                    case 'en':  return eventStart.format('ddd, MMMM D') +
                                                (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) +
                                                ' - ' +
                                                nextDay.format('ddd, MMMM D') +
                                                ((new Date()).getFullYear() === Number(event.end.format('YYYY')) ? '' : (', ' + eventEnd.format('YYYY')));
                                    
                                    case 'ja':  return (isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ')) +
                                                eventStart.format('M月 D日 ddd') +
                                                ' - ' +
                                                (isEndSameYear() ? '' : (eventEnd.format('YYYY年') + ' ')) +
                                                nextDay.format('M月 D日 ddd');
                                    
                                    case 'ko':  return (isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ')) +
                                                eventStart.format('M월 D일 dddd') +
                                                ' - ' +
                                                (isEndSameYear() ? '' : (eventEnd.format('YYYY년') + ' ')) +
                                                nextDay.format('M월 D일 dddd');
                                    
                                    case 'es':  return eventStart.format('ddd, D [de] MMMM') +
                                                (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) +
                                                ' - ' +
                                                nextDay.format('ddd, D [de] MMMM') +
                                                (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY')));
                                                
                                    default:    return eventStart.format('ddd, MMMM D') +
                                                (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) +
                                                ' - ' +
                                                nextDay.format('ddd, MMMM D') +
                                                (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY')));
                                }
                            }
                        };
                        //console.log("event.multiDayEvent filter: ",event);
                        
                        return ( (eventStart.format('YYYYMMDD') === nextDay.format('YYYYMMDD')) || (!event.multiDayEvent && event.allDay)) ? me.Day(): me.Other();
                    },
                    Other: function () {
                        var me = {
                            Unknown: function () {
                                switch (lang) {
                                    case 'en':  return (is24h) ?
                                                eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') :
                                                eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma');
                                                
                                    case 'ja':  return (is24h) ?
                                                (isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ') + eventStart.format('M月 D日 ddd')) + ', ' + eventStart.format('HH:mm') :
                                                (isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ') + eventStart.format('M月 D日 ddd')) + ', ' + eventStart.format('h:mma');
                                                
                                    case 'ko':  return (is24h) ?
                                                (isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ') + eventStart.format('M월 D일 dddd')) + ', ' + eventStart.format('HH:mm') :
                                                (isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ') + eventStart.format('M월 D일 dddd')) + ', ' + (Number(eventStart.format('m')) === 0 ? eventStart.format('Ah시') : eventStart.format('Ah시mm분'));
                                    
                                    case 'es':  return (is24h) ?
                                                eventStart.format('ddd, D [de] MMMM') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') :
                                                eventStart.format('ddd, D [de] MMMM') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma');
                                    
                                    case 'nl':  return (is24h) ?
                                                eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH.mm') :
                                                eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h.mma');
                                    
                                    default:    return (is24h) ?
                                                eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') :
                                                eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma');
                                }
                            },
                            Day: function () {
                                switch (lang) {
                                    case 'en':  return (is24h) ?
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') + ' - ' + eventEnd.format('HH:mm')) :
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma') + ' - ' + eventEnd.format('h:mma'));
                                    
                                    case 'ja':  return (is24h) ?
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ')) + eventStart.format('M月 D日 ddd') + ', ' + eventStart.format('HH:mm') + ' - ' + eventEnd.format('HH:mm')) :
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ')) + eventStart.format('M月 D日 ddd') + ', ' + eventStart.format('h:mma') + ' - ' + eventEnd.format('h:mma'));
                                    
                                    case 'ko':  return (is24h) ?
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ')) + eventStart.format('M월 D일 dddd') + ', ' + eventStart.format('HH:mm') + ' - ' + eventEnd.format('HH:mm')) :
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ')) + eventStart.format('M월 D일 dddd') + ', ' + (Number(eventStart.format('m')) === 0 ? eventStart.format('Ah시') : 
                                                eventStart.format('Ah시mm분')) + ' - ' + (Number(eventEnd.format('m')) === 0 ? eventEnd.format('Ah시') : eventEnd.format('Ah시mm분')));
                                    
                                    case 'es':  return (is24h) ?
                                                (eventStart.format('ddd, D [de] MMMM') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') + ' - ' + eventEnd.format('HH:mm')) :
                                                (eventStart.format('ddd, D [de] MMMM') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma') + ' - ' + eventEnd.format('h:mma'));
                                    
                                    case 'nl':  return (is24h) ?
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH.mm') + ' - ' + eventEnd.format('HH.mm')) :
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h.mma') + ' - ' + eventEnd.format('h.mma'));
                                    
                                    default:    return (is24h) ?
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') + ' - ' + eventEnd.format('HH:mm')) :
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma') + ' - ' + eventEnd.format('h:mma'));
                                }
                            },
                            Other: function () {
                                switch (lang) {
                                    
                                    case 'en':  return (is24h) ?
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') + ' - ' + nextDay.format('ddd, MMMM D') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ', ' + eventEnd.format('HH:mm')) :
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma') + ' - ' + nextDay.format('ddd, MMMM D') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ',' + eventEnd.format('h:mma'));
                                    
                                    case 'ja':  return (is24h) ?
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ')) + eventStart.format('M月 D日 ddd') + ', ' + eventStart.format('HH:mm') + ' - ' + (isEndSameYear() ? '' : (eventEnd.format('YYYY年') + ' ')) + nextDay.format('M月 D日 ddd') + ', ' + eventEnd.format('HH:mm')) :
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY年') + ' ')) + eventStart.format('M月 D日 ddd') + ', ' + eventStart.format('h:mma') + ' - ' + (isEndSameYear() ? '' : (eventEnd.format('YYYY年') + ' ')) + nextDay.format('M月 D日 ddd') + ',' + eventEnd.format('h:mma'));
                                    
                                    case 'ko':  return (is24h) ?
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ')) + eventStart.format('M월 D일 dddd') + ', ' + eventStart.format('HH:mm') + ' - ' + (isEndSameYear() ? '' : (eventEnd.format('YYYY년') + ' ')) + nextDay.format('M월 D일 dddd') + ', ' + eventEnd.format('HH:mm')) :
                                                ((isStartSameYear() ? '' : (eventStart.format('YYYY년') + ' ')) + eventStart.format('M월 D일 dddd') + ', ' + (Number(eventStart.format('m')) === 0 ? eventStart.format('Ah시') : eventStart.format('Ah시mm분')) + ' - ' + (isEndSameYear() ? '' : (eventEnd.format('YYYY년') + ' ')) + nextDay.format('M월 D일 dddd') + ',' + (Number(eventEnd.format('m')) === 0 ? eventEnd.format('Ah시') : eventEnd.format('Ah시mm분')));
                                    
                                    case 'es':  return (is24h) ?
                                                (eventStart.format('ddd, D [de] MMMM') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') + ' - ' + nextDay.format('ddd, D [de] MMMM') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ', ' + eventEnd.format('HH:mm')) :
                                                (eventStart.format('ddd, D [de] MMMM') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma') + ' - ' + nextDay.format('ddd, D [de] MMMM') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ',' + eventEnd.format('h:mma'));
                                    
                                    case 'nl':  return (is24h) ?
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH.mm') + ' - ' + nextDay.format('ddd, MMMM D') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ', ' + eventEnd.format('HH.mm')) :
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h.mma') + ' - ' + nextDay.format('ddd, MMMM D') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ',' + eventEnd.format('h.mma'));
                                    
                                    default:    return (is24h) ?
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('HH:mm') + ' - ' + nextDay.format('ddd, MMMM D') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ', ' + eventEnd.format('HH:mm')) :
                                                (eventStart.format('ddd, MMMM D') + (isStartSameYear() ? '' : (', ' + eventStart.format('YYYY'))) + ', ' + eventStart.format('h:mma') + ' - ' + nextDay.format('ddd, MMMM D') + (isEndSameYear() ? '' : (', ' + eventEnd.format('YYYY'))) + ',' + eventEnd.format('h:mma'));
                                }
                            }
                        };
                        
                        if (eventEnd === undefined) {
                            return me.Unknown();
                        } else {
                            return (eventStart.format('YYYYMMDD') === nextDay.format('YYYYMMDD')) ? me.Day() : me.Other();
                        }
                    }
                };
                //console.log("event.allDay",me.AllDay());
                return (event.allDay) ? me.AllDay() : me.Other();
            }
        };

        args = textFormat.split('.');
        type = args.shift();
        
        if (typeof me[type] === 'function') {
            return  (args.length > 0) ? me[type].call(this, args.join('.')) : me[type].call(this);
        } 
     };
 });