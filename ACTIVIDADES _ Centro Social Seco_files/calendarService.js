angular.module(objParams.appName).service("calendarService",["OBJECT_PARAMS","$timeout","$log","$translate","$filter","$rootScope","wixService",
    function(OBJECT_PARAMS,$timeout,$log,$translate,$filter,$rootScope, wixService){
    var constants       = OBJECT_PARAMS.constants;
    var self            = this;
    var minTime         = "00:00";
    var maxTime         = "23:59";
    var settings        = {};
    var scrollerEl      = '';
    var offsetHeight	= 0;
    var days            = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    
    this.fcHelperHidePopover = function(){
        //return;
        $('.webui-popover').remove();
    };
    
    this.getTranslateByKey = function(key){
        return $translate.instant(key,{},{},settings.lang);
    };
        
    this.resetCalendar = function(){
        $(constants.CALENDAR_ID).fullCalendar('gotoDate', moment());
         
        $timeout(function(){
            self.fcHelperHidePopover();
        },500);
    };
    
    this.todayText = function(){
        return self.getTranslateByKey('today');
    };
    
    this.allDayText = function(show){
        return (show) ? self.getTranslateByKey('event_all_day') : '';
    };
    
    this.timezoneText = function(show){
        //$log.log($(constants.CALENDAR_ID).fullCalendar('option', 'timezone'));
        var html = '<span class="lblTimezone">'+self.getTranslateByKey('timezone')+':</span>' +
                   '<span class="offset"> GMT ' + moment.tz(self.getCalendarTimezone()).format('Z') ;
                   
        return html;
    };
    
    function initParams(aSettings){
        try{
            settings = aSettings;
			offsetHeight = 0;
			            
            if(self.isWeek()){
                scrollerEl  	= '.fc-time-grid-container';
                minTime     	= settings.minTime;
                maxTime     	= settings.maxTime;
                offsetHeight	= 40;
            }else if(self.isAgenda()){
                offsetHeight    = 40;
            }
            // $log.log('minTime:',minTime, 'maxTime:',maxTime);
            
        }catch(e){
            $log.info(e);
        }
    }
    
    this.getViewName = function (){
        var viewName;
        var defaultView = settings.defaultView+'';
        
        switch(defaultView){
            case constants.MONTH_VIEW       :  viewName = 'month';      break;
            case constants.WEEK_VIEW        :  viewName = (settings.isTimetable) ? 'timetable' : 'agendaWeek' ; break;
            case constants.AGENDA_VIEW      :  viewName = 'agendaList'; break;
            case constants.MOBILE_VIEW      :  viewName = 'mobile';     break;
            default: viewName='month';
        }
        //$log.log('viewName',viewName,defaultView);
        return viewName;
    };
    
    this.getLayoutType = function(){
        var layoutTypeVals      = {'month':'monthly','timetable':'weekly', 'agendaWeek': 'weekly', 'agendaList':'agenda'};
        var layoutName          = self.getViewName();
        return layoutTypeVals[layoutName];
    }; 
    
    this.getFCLang = function(){
        var lang = angular.lowercase(settings.lang) || constants.DEFAULT_LANGUAGE;
        
        switch (lang){
            case "po": lang = "pl"; break;
            case "no": lang = "nb"; break;
        }

        return lang;
    };
    /*************************************************************************************************************************/
    this.isShortDayName = function() {
        var ww = $(window).width();
        
        if(self.isMonth())   return (ww <= constants.MONTH_VIEW_DISPLAY_SHORT_DAY_NAME);
        if(self.isWeek())    return (ww <= constants.WEEK_VIEW_DISPLAY_SHORT_DAY_NAME);
        if(self.isAgenda())  return (ww <= constants.AGENDA_VIEW_DISPLAY_SHORT_DAY_NAME);

        return false;
    };
    
    this.getMonthFormat = function(){
        return  this.isShortDayName() ? 'ddd' : 'dddd';
    };
    
    this.isShortMonthName = function() {
        var ww = $(window).width();
        
        if(self.isMonth())   return (ww <= constants.MONTH_VIEW_DISPLAY_SHORT_MONTH_NAME);
        if(self.isAgenda())  return (ww <= constants.AGENDA_VIEW_DISPLAY_SHORT_MONTH_NAME);
        
        return false;
    };
    
    this.getMonthYearFormat = function(){
        return this.isShortMonthName() ? 'MMM YYYY' : 'MMMM YYYY';
    };
    
    /*************************************************************************************************************************/
    this.isMonth = function(){
        return settings.defaultView == constants.MONTH_VIEW;
    };

    this.isWeek = function (){
        return (settings.defaultView == constants.WEEK_VIEW) && !settings.isTimetable;
    };
    
    this.isAgenda = function(){
        return settings.defaultView == constants.AGENDA_VIEW;
    };

    this.isTimetable = function(){
        return (settings.defaultView == constants.WEEK_VIEW) && settings.isTimetable;
    };
    
    this.isMobile = function(){
        return (Wix.Utils.getDeviceType() === constants.MOBILE);
    };
    this.isLiveSite = function(){
    	return (Wix.Utils.getViewMode() === constants.SITE_MODE);
    };
    
    this.isConnected = function(){
        return (settings.accountDetails.selected_cal != "");
    };
    /**************************************************************************************************************************/
    /**
     * @name:    hiddenDays
     * @param:   void
     * @return   return array of hide days
     */
    function hiddenDays(){
        var arrHiddenDays = [];
        
        if((self.isMonth()  || self.isTimetable() || self.isWeek()) && settings.activeWeekDays.displayType !== 0){
            var dayId               = 0,
                arrActiveWeekDays   = settings.activeWeekDays || {};
            
            angular.forEach(arrActiveWeekDays,function(record,key){
                if(record===0 && key !=="displayType"){
                    arrHiddenDays.push(Math.max(0,days.indexOf(key)));
                }
            });
        }
        return arrHiddenDays;
    };
    
    function getSelectedCalendars(){
        var calendars = (settings.accountDetails.selected_cal != "" ) ? settings.accountDetails.selected_cal : (settings.accountDetails.emailAddress !=="") ? "" : constants.GOOGLE_CALENDAR_DEMO;
        return calendars;
    }
    
    function getCalendars(){
        var calendars       = getSelectedCalendars();
        var isDemoAccount   = (calendars == constants.GOOGLE_CALENDAR_DEMO);
        var demoTitle       = self.getTranslateByKey('test_event');
        //var calendars       = "theahstrackandfield@gmail.com"; // 'npf2idm4srq6h8lksculpq3tgs@group.calendar.google.com,';
        //console.log("calendars: ",calendars,constants.GOOGLE_CALENDAR_DEMO,isDemoAccount);
        var calendarList = calendars.split(",")
                           .filter(function(elm){ return elm.length;}) // remove empty entity
                           .map(function(elm){ 
                                return  {
                                    googleCalendarApiKey: self.getGoogleApiKey(),
                                    googleCalendarId:  elm, 
                                    className: 'gcal-event',
                                    orderBy:'startTime',
                                    data:{
                                        orderBy:'startTime',
                                        cache: true
                                    },
                                    cache: true,
                                    isDemoAccount: isDemoAccount,
                                    demoTitle: demoTitle
                               }; 
                           });
                
        //$log.log('calendarList:',calendarList);
        return  calendarList;
    }
    
    this.getCalendarTimezone = function(){
        var timezone = settings.accountDetails.timezone || constants.GOOGLE_CALENDAR_DEMO_TIMEZONE;
        //timezone = "America/New_York";
        return  timezone;
    };
    
    this.refreshCalendar = function(){
         angular.element(constants.CALENDAR_ID).fullCalendar('rerenderEvents');
    };
    
    this.setCalendarContentHeight = function(){
    	angular.element(constants.CALENDAR_ID).fullCalendar('option', 'contentHeight', self.getWindowHeight()-offsetHeight);
    	$timeout(function(){
            self.updatePerfectScrolling();    
    	},200);
    };
    
    var setHeightPopover = function(description,location){
        var elm = {popoverHeight:110, scrollHeight: 85};
        return elm;
    };
    
    this.eventTitle = function(event ){
        //console.log('event.title: ', event.title);
        return (event.title !='') ? event.title : self.getTranslateByKey('event_no_title'); 
    };
    
    this.getEventData = function (event){
        var eventData = {};
         
        if(!angular.isUndefined(event) && event !==''){
            var lang    = getLocale();
            eventData = {
                id          : event.id,
                uniqeId     : event.uniqeId,
                lang        : lang,
                title       : self.eventTitle(event),
                copyText    : self.getTranslateByKey('event_tooltip_copy_event'),
                startDate   : $filter('timeToText')('Title.Hour',event,lang,false),
                endDate     : moment(event.end).format('MMM Do h:mm A'),
                description : angular.isUndefined(event.description ) ? '': $filter('urlToLink')(event.description),
                location    : angular.isUndefined(event.location) ?  '': $filter('urlToLink')(event.location)
            };
            event.multiDayEvent = (angular.isDefined(event.multiDayEvent) && event.multiDayEvent);
            
            //show start & end time event for multiDayEvent
            if(event.multiDayEvent)  
                event.allDay = false;
            
            eventData.startDateTime = eventData.startDate;
            eventData.startDate     = $filter('timeWithClock')(eventData.startDate);
            eventData.when          = self.getTranslateByKey('event_when') + ': ' + $filter('timeToText')('Description', event);
            eventData.multiDayEvent = event.multiDayEvent;
            eventData.allDay        = event.allDay;  
            eventData.location      = (eventData.location !== '')    ?  self.getTranslateByKey('event_where') + ': ' + eventData.location  : '';
            eventData.description   = (eventData.description !== '') ?  self.getTranslateByKey('event_description') + ': ' + eventData.description  : '';
        }
        
        return eventData;
    };
    
    this.getSingleEventHTMLPopover = function(eventUniqeId, backBtn){
        var eventData   = self.getEventData($filter('getEventById')(eventUniqeId)); 
        var html        = '<div class="fc-content-singal-event">' +
                                ((backBtn) ? '<div class="popover-btnBack" ng-click="showEventList()">&#9664; '+ self.getTranslateByKey('event_tooltip_all') +'</div>' : '' )+
                                '<ul class="event-data">' +
                                    '<li><span class="fc-title">'+eventData.title+'</span></li>' +
                                    '<li><span class="fc-when">'+eventData.when+'</span></li>' +
                                    ((eventData.location && eventData.location !== '') ? '<li><span class="fc-location">'+eventData.location+'</span></li>' : '' )+
                                    ((eventData.description && eventData.description !== '') ? '<li><span class="fc-description">'+eventData.description.nl2br()+'</span></li>' : '' )+
                                '</ul>'+
                                '<div class="copy-event"><span ng-click="copyToMyGoogleCalendar(\''+eventUniqeId+'\')">'+eventData.copyText+'</span></div>' +
                           '</div>';

        var elm = {html:html, height: setHeightPopover(eventData.description,eventData.location) };

        return elm;
    };
    
    String.prototype.nl2br = function() {
        return this.replace(/\n/g, "<br />");
    };
      
    this.getAgendaEventHTML = function(eventUniqeId){
        if(self.isAgenda()) {
            var eventData  = self.getEventData($filter('getEventById')(eventUniqeId));
            
            if(!angular.isUndefined(eventData)){
                var html =  '<li class="event-details">' +
                                '<div class="fc-when">'+eventData.when+'</div>' +
                                ((eventData.location && eventData.location !== '') ? '<div><span class="fc-location">'+eventData.location+'</span></div>' : '')+
                                ((eventData.description &&  eventData.description !== '') ? '<div><span class="fc-description">'+eventData.description.nl2br()+'</span></div>' : '') +
                            '</li>' +
                            '<li class="agenda-copy-event"><span onclick="copyToMyGoogleCalendar(\''+eventUniqeId+'\')">'+eventData.copyText+'</span></li>';
                return html;
            }
            return '';    
        }
        return '';
    };
    
    this.copyToMyGoogleCalendar = function(eventUniqeId){
        //get event by id
        var event = $filter('getEventById')(eventUniqeId);
        if (angular.isUndefined(event) || event === "") return ;
        
        url = $filter('linkGoogleShare')(event);
        openPopup(url,800,800);
    };
    
    this.calendarTitle = function(fun, eventTime){
        return $filter('timeToText')(fun,eventTime, settings.lang,false);
    };
    
    this.getEventTimeText = function(event,icon, isMultiDayEvent){
        var arrTimes    = {},
            lang        = getLocale(constants.DEFAULT_LANGUAGE),
            time        = ($filter('timeToText')('Title.Hour',event,lang,true)).split('-');
        
        var startTime   = $filter('htmlEscape')(time[0]),
            endTime     = $filter('htmlEscape')(time[1]),
            shortTime   = (event.allDay) ? '' : startTime,
            longTime    = '',
            startDate   = event.start.clone().format('DD MMM '),
            endDate     = event.end.clone().format('DD MMM ');
            
        if((!event.allDay && isMultiDayEvent)  || event.multiDayEvent) {
            var dateTime;
            if(self.isMobile()){
                dateTime =  '<span class="eventDate">'  + startDate + '</span>'+ 
                            '<span class="eventHours">' + startTime + '</span> - ' + 
                            '<span class="eventDate">'  + endDate + '</span>'+ 
                            '<span class="eventHours">' +endTime + '</span>';
            }else{
                dateTime = startDate + startTime + ' - ' + endDate + endTime ;
            }
            
            longTime = ((icon) ? $filter('timeWithClock')('') :'') + dateTime;
        }else{
            longTime = ((icon) ? $filter('timeWithClock')('') : '') + startTime + ' - ' + endTime;
        }
        
        arrTimes    = { shortTime: shortTime, 
                        fullTime: longTime,
                        allDayText: self.allDayText(true),
                        allDayTextWithIcon: $filter('timeWithClock')(self.allDayText(true))
                      };
        
        return arrTimes;
    };
    
    function setScroll (update){
        if(scrollerEl !=''){
            if(update) {
                angular.element(scrollerEl).perfectScrollbar('update');
            }else{
                angular.element(scrollerEl).perfectScrollbar('destroy');
                angular.element(scrollerEl).perfectScrollbar({ wheelPropagation: true,useBothWheelAxes:true,scrollXMarginOffset:10});
            }
        }
    }    
   
    this.setPerfectScrolling = function(){
       setScroll(false);
    };
    
    this.updatePerfectScrolling = function(){
        setScroll(true);
    };
    
    var canResize       = false;
    var isUpdateHeight  = false;
    
    function reRenderCalendar(){
        renderCalendar(false, $(window).height());
        return;
    }

    this.handleWindowResize = function(){
    	return (self.isMobile() || self.isMonth());
    };
    
    this.getWindowHeight = function(){
    	return $(window).height();
    };
    
    this.putArrows = function(){
        //change left & right arrow
        angular.element('.fc-icon.fc-icon-left-single-arrow').prepend($filter('prevIcon'));
        angular.element('.fc-icon.fc-icon-right-single-arrow').prepend($filter('nextIcon'));
	};
	
	this.showTodayLabel=  function(){
		angular.element('.fc-today-button').removeClass('opacity0');
        if(self.isLiveSite()) {
            angular.element('.fc-corner-right.fc-state-disabled').addClass('opacity0');
        }
	};
	
	this.getTitleFormat = function(defaultFormat){
	   /* switch(self.getFCLang()) {
	         case 'ja':  defaultFormat = ('YYYY年 M月'); break;
             case 'ko':  defaultFormat = ('YYYY년 M월'); break;
	    }*/
	    
        return defaultFormat;
	};
	
	this.getGoogleApiKey = function(){
	    return constants.GOOGLE_CALENDAR_API_KEY;
	};
	
	this.is12Hours = function(){
	    return (settings.timeFormat == 0);
	};
	
	this.getWeekStartsOn = function(){
	    var dayKey = settings.weekFirstDay || 0;
	    return days[dayKey];
	};
	
	this.getDaysToDisplay = function(){
	    var arrHiddenDay = hiddenDays();
	    var showDays     = [];
	                 
        angular.forEach(days,function(record,key){
            if (angular.isUndefined(arrHiddenDay[record]) || arrHiddenDay[record] < 0) {
                showDays.push(record);
            }     
        });
        
        showDays = showDays.join(",") +"";
        return showDays;
	};
	
	
	this.getDaysToDisplayType = function(){
	    var displayType = ["all","business","specific"];
	    return displayType[settings.activeWeekDays.displayType];
	};
	
	this.getNumberOfCalendars = function(){
	    if(self.isConnected()) {
	        var calendars = getCalendars();
	        return calendars.length; 
	    } 

	    return 0;
	};
	
	this.initPerformance = function(){
        try {
            wixService.Performance.applicationLoadingStep(1, "events_loaded_from_API");
        } catch (err) {
            console.log('Wix.Performance applicationLoadingStep: ', err);
        }
    };
	 
    function renderCalendar(windowContent, mHeight) {
        try{
            $(constants.CALENDAR_ID).fullCalendar('destroy');
        }catch(err){
            $log.log("renderCalendar err: ",err);
        }
        
        if(self.isLiveSite() && !self.isMobile()) {
            mHeight = $(window).height(); 
        }
        
        $(constants.CALENDAR_ID).fullCalendar({
            lang: self.getFCLang(),
            header:{
                left: 'today',
                center: 'prev,title,next',
                right: 'timezone'
            },
            theme:          false,
            editable:       false,
            timezone:       self.getCalendarTimezone(),
            eventLimit:     true, // allow "more" link when too many events
            eventLimitText: '',// remove "more"
            // Multiple Sources
            eventSources: getCalendars(),
            views: {
                agenda: {
                    titleFormat: self.getTitleFormat('MMMM YYYY')
                },
                agendaList:{
                    titleFormat: self.getTitleFormat('MMMM YYYY'),
                    duration: { months: 1}
                },
                agendaWeek:{
                    eventLimit: 2,
                    nextDayThreshold: '00:01:00', // 12:01am
                    titleFormat: self.getTitleFormat("DD MMM YYYY"),
                    titleRangeSeparator: ' - '
                },
                month:{
                    titleFormat:self.getTitleFormat('MMMM YYYY'),
                    nextDayThreshold: '00:01:00', // 12:01am
                },
                mobile:{
                    titleFormat: self.getTitleFormat('MMM YYYY')
                },
                timetable:{
                    //allDayText: self.allDayText()
                }
            },
            aspectRatio:        (self.isMonth()) ? 1.2 : 1.35,
            monthYearFormat:    self.getMonthYearFormat(),
            defaultView:        self.getViewName(),
            firstDay :          settings.weekFirstDay || 0,
            hiddenDays:         hiddenDays(),
            slotDuration:       "01:00:00",
            minTime:            minTime,
            maxTime:            maxTime,
            axisFormat:         (settings.timeFormat == 1) ? 'HH:mm' : 'h:mma',
            slotEventOverlap:   true,
            loading: function(bool) {
                $('#loading').toggle(bool);
                if(!bool) {
                    self.setPerfectScrolling();
                    $rootScope.$broadcast('showLessReady');    
                }
            },
            viewRender: function(view, element){
                self.fcHelperHidePopover();
            },
            windowResize: function(view) {
                if(self.isMobile()){
                    
                }else if(self.isMonth()){
                    self.fcHelperHidePopover();
                    self.updatePerfectScrolling();
                    $rootScope.$broadcast('calendarIsReady');
                }else{
                	var newheight = $(window).height();
	                var bHeightChanged = false;
	                
	                if (newheight !== $(this).fullCalendar('option', 'contentHeight')){
	                    bHeightChanged = true;
	                    self.setCalendarContentHeight();
	                }
                }
            },
            eventAfterAllRender: function(view) {
                self.initPerformance();
            	self.showTodayLabel();	            
	            $rootScope.$broadcast('calendarIsReady',mHeight);
            },
            eventClick: function(event,element) {},
            eventRender: function (event, element) {},
            eventResizeStart: function(event, jsEvent, ui, view ){},
            eventResize: function(event, delta, revertFunc) {}
        });
        
        self.putArrows();
        if(!self.handleWindowResize()){
        	self.setCalendarContentHeight();
        }
    }
    
    this.initApp = function(aSettings) {
        initParams(aSettings);
        renderCalendar(true);
    };
}]);