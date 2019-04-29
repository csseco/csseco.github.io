/**
 * @name MainCtrl 
 * @Discreption:    Main controller.
 *                  Controlls display and changing of the settings parameters
 */
angular.module(objParams.appName).controller("MainCtrl",["$scope","$window","$http","$timeout",
    "OBJECT_PARAMS","$log","styleService", "calendarService","biService","wixService","$translate","$q","$filter","$document","$compile",
    function($scope,$window, $http,$timeout,OBJECT_PARAMS,$log, styleService,calendarService,biService,wixService,$translate,$q,$filter,$document,$compile){
    "use strict";
    
    $scope.inited           = false;
    $scope.settings         = OBJECT_PARAMS.settings;
    $scope.slimscrollOption = {height:'auto',color:'#d6dce4', opacity: 1 ,alwaysVisible:false, distance:'5px', size: '6px',scrollTo:0};
    $scope.data_error		= false;
    $scope.scrollingTop     = true;
    $scope.cntDays          = 1;

    var constants           = OBJECT_PARAMS.constants,
        cookieKey           = getCookieKey(),
        layout              = wixService.Utils.getDeviceType(),
        eventsListeners     = {},
        g_isLiveSite        = (wixService.Utils.getViewMode() === constants.SITE_MODE);
	
    /*********************************************************FC Helper Functions****************************************************************/
    $scope.showEventList = function(){
        angular.element('.webui-popover .event-details').hide();
        angular.element('.webui-popover .fc-event-container').show();
    };
    
    $scope.showEventDetails = function(eventUniqeId){
        var elm = $scope.getSingleEventHTMLPopover(eventUniqeId,true);
        angular.element('.webui-popover .fc-event-container').hide();
        angular.element('.webui-popover .event-details').empty().append(elm.html).show();
        
        angular.element('.webui-popover .event-details .fc-description').slimScroll({
            height: '80px',
            width: '220px;'
        });
        
        $scope.$broadcast('popoverIsReady');
    };
   
    $window.getTimeFormat = function(){
        return ($scope.settings.timeFormat == constants.TIME_FORMAT_24);      
    };
    
    $window.isShortDayName = function(){
        return calendarService.isShortDayName();      
    };
   
    $window.isShortMonthName = function(){
        return calendarService.isShortMonthName();      
    };
        
    $window.getEventTimeText = $scope.getEventTimeText = function(event,icon,isMultiDayEvent){
        return calendarService.getEventTimeText(event,icon,isMultiDayEvent);
    };
    
    $scope.getSingleEventHTMLPopover = function(eventUniqeId, backBtn){
        return calendarService.getSingleEventHTMLPopover(eventUniqeId, backBtn);
    };
    
    $scope.getAgendaEventHTML = function(eventUniqeId){
        return calendarService.getAgendaEventHTML(eventUniqeId);
    };
    
	$window.copyToMyGoogleCalendar = $scope.copyToMyGoogleCalendar = function(eventUniqeId) {
	    calendarService.copyToMyGoogleCalendar(eventUniqeId);
	};
	
	$window.eventTitle = $scope.eventTitle = function(event){
        return calendarService.eventTitle(event);
    };
    
    $window.calendarTitle = $scope.calendarTitle = function(fun, eventTime){
        return calendarService.calendarTitle(fun,eventTime);
    };
    
	$scope.todayText = function(){
	    return calendarService.todayText();
	};
	
	$scope.allDayText = function(){
        return calendarService.allDayText();
    };
	
	$scope.timezoneText = function(){
        return calendarService.timezoneText();
    };
	
	$window.getCalendarTimezone = $scope.getCalendarTimezone = function(){
	   return calendarService.getCalendarTimezone();
	};
	
	$scope.isMonth = function(){
        return calendarService.isMonth();
    };
    
	$scope.isWeek = function(){
        return calendarService.isWeek();
    };
    
    $scope.isTimetable = function(){
        return calendarService.isTimetable();
    };
    
    $scope.isAgenda = function(){
        return calendarService.isAgenda();
    };
    
    $window.isMobile = $scope.isMobile = function() {
        return calendarService.isMobile() ;
    };
	/**********************************************************Mobile FC Helper***************************************************************************/
	$scope.canNotShowMe = function(dayId){
	    return (dayId > $scope.cntDays) ;
	};
	
	$scope.canShowMe = function(dayId){
        return !(dayId == $scope.cntDays) ;
    };
	
	$scope.updateCntDay= function(num){
	    safeApply(function(){
           $scope.cntDays = num;    
        });
	};
	
	$scope.showLess = function(){
	    $scope.updateCntDay(1);
	    $timeout(function(){
            setHeightApp();
        },300);
    };
    
    $scope.showMore = function(){
        $scope.updateCntDay(31);
        
        $timeout(function(){
            setHeightApp();
        },300);
    };
	
	
	
	$scope.showLessLink = function(){
	    return  $filter('viewLessText')(calendarService.getTranslateByKey('event_view_less'));
	};
	
	$scope.showMoreLink = function(){
	    return  $filter('viewMoreText')(calendarService.getTranslateByKey('event_view_more'));
    };
    
    $scope.showEventData = function(eventUniqeId,$event){
        try{
            $event.stopPropagation();
        }catch(err){
            log.log(eventUniqeId,err);
        }
        
        var event       = angular.copy($filter('getEventById')(eventUniqeId));
        //console.log("eventData",eventData);
        //console.log("eventUniqeId",eventUniqeId);
        
        if(!angular.isUndefined(event.id)){
            var eventData   = calendarService.getEventData($filter('getEventById')(eventUniqeId));    
            var url         = $filter('linkGoogleShare')(event);
            
            eventData.copyText  = '<span onclick="openPopup(\''+url+'\',800,800)">'+eventData.copyText+'</span>';
            localStorage.setItem("eventId", JSON.stringify(eventData));
            
            var popupURL    = window.location.protocol+"//" +window.location.hostname+"/mobile/show-event-details"+document.location.search +'&wCompId='+wixService.Utils.getCompId();
            var onClose     = function(message) { };
            
            wixService.openModal(popupURL , 280, 300, onClose , wixService.Theme.BARE);
        }
    };
	/***************************************************************************************************************************************************/
    $scope.getWindowDimensions = function () {
        var w = angular.element($window);
        return {
            'h': w.height(),
            'w': w.width()
        };
    };
	
	$scope.isFireFox = function(){
	    var ua     = navigator.userAgent;
        var ISFF   = ua.indexOf('Firefox') !== -1;
        return ISFF; 
	};

	/*
	 * @param 		fn - function
	 * @return 		none
	 * @description digest out-of-scope data
	 */        
    function safeApply(fn) {
        $timeout(fn);
    }
    
    function applyNewSettings(settings){
        safeApply(function(){
            $scope.settings  = settings;
			styleService.applyLayoutStyle($scope.settings,$scope.styleParams,$scope.isMobile());    
        });
    }
    
     function biOnSavePublish(eventTrigger){
           /*
            "wixlabs_bool_1 - is_connected to google account
            wixlabs_bool_2 - is timetable selected
            wixlabs_bool_3 - selected time format (true = 12 / false = 24)
            wixlabs_string_1 - selected layout type
            wixlabs_string_2 - week starts on
            wixlabs_string_3 - days to show - send all / business / specific and not the names of the days
            wixlabs_string_4 - selected language
            wixlabs_num_1 - number of calendars displayed
            event_trigger - save / publish"
             */  
         
        var bConnected          = calendarService.isConnected() ? 'true' : 'false',
            bTimetable          = calendarService.isTimetable()?'true':'false',
            bTimetFormat        = calendarService.is12Hours()?'true':'false',
            sLayoutType         = calendarService.getLayoutType(),
            sWeekStartsOn       = calendarService.getWeekStartsOn(),
            sDaysToDisplay      = calendarService.getDaysToDisplayType(),
            sLanguage           = calendarService.getFCLang(),
            nNumberOfCalendars  = calendarService.getNumberOfCalendars();
        
       /*console.log("\nbConnected:" ,bConnected,
           "\nbTimetable:",bTimetable, 
           "\nbTimetFormat:",bTimetFormat,
           "\nsLayoutType:", sLayoutType,
           "\nsWeekStartsOn:", sWeekStartsOn,
           "\nsDaysToDisplay:",sDaysToDisplay,
           "\nsLanguage:", sLanguage,
           "\nnNumberOfCalendars:", nNumberOfCalendars,
           "\neventTrigger:",eventTrigger);
       */
        biService.savePublish([bConnected, bTimetable, bTimetFormat, sLayoutType, sWeekStartsOn, sDaysToDisplay, sLanguage, nNumberOfCalendars, eventTrigger]);
    }
    
    /**
     * @name    trackWixEvents
     * @params  none
     * @return  none
     * @desc    Listen to wix styles params changes and apply them by calling applyWixStyles()
     */
    function trackWixEvents() {
        var evid = eventsListeners.SPC || "-1";
        
        if (evid === "-1"){        	
            eventsListeners.SPC = wixService.addEventListener(wixService.Events.STYLE_PARAMS_CHANGE, function(styleParams){
                applyWixStyles(styleParams);    
            });
            
            wixService.addEventListener(wixService.Events.EDIT_MODE_CHANGE, function(message){
                g_isLiveSite = (message.editMode ===  constants.SITE_MODE); 
                if(message.editMode === constants.EDITOR_MODE){
                    calendarService.resetCalendar();
                }
            });
            
            wixService.addEventListener(wixService.Events.SETTINGS_UPDATED, function(params) {
                params.settings.layout  = calendarService.getViewName();
                
                applyNewSettings(params.settings);
                
                safeApply(function(){
                    $scope.settings = params.settings;
                    $scope.initLanguage(function(){
                        initCalendar(params.settings);    
                    });
                });
            });
            
			wixService.Styles.getStyleParams(applyWixStyles);
			
			// hide shown popover on scrolling
            $(document).on('ps-scroll-x', function (event) {
                calendarService.fcHelperHidePopover();
            });
            
            $(window).blur(function (event) {// hide popover when click outside iframe
                calendarService.fcHelperHidePopover();
            });
           
            wixService.addEventListener(wixService.Events.SITE_SAVED,function(){
               // biOnSavePublish('save');
            });
            
            wixService.addEventListener(wixService.Events.SITE_PUBLISHED,function(){
                biOnSavePublish('publish');
            });
        }
    }
    
    function applyWixStyles(styleParams){   
        safeApply(function(){
            styleParams                 = styleParams || $scope.styleParams;        
            $scope.styleParams          = styleParams;
            $scope.styleParams.colors   = styleParams.colors || {};
            $scope.settings.layout      = calendarService.getViewName();
            
            styleService.applyLayoutStyle($scope.settings,$scope.styleParams,$scope.isMobile());
            $scope.$broadcast('stylechange',$scope.styleParams);
        }); 
    }
    
    function initCalendar(settings){
        calendarService.initApp(settings); 
    }
    
    $scope.$on('showLessReady', function(event, args) {
        if($scope.isMobile())
            $scope.showLess(); //reset mobile nav
    });
    
    $scope.$on('calendarIsReady', function(event, height) {
        $timeout(function(){
            $compile($(constants.CALENDAR_ID))($scope);
            $scope.calendarType = calendarService.getViewName();
            
            if(calendarService.handleWindowResize())
            	setHeightApp(height);
        },100);
        
        /*if (g_isLiveSite) {
            $timeout(function(){
                try{
                    html2canvas($(constants.CALENDAR_ID), {
                        onrendered: function(canvas) {
                            // canvas is the final rendered <canvas> element
                            document.body.appendChild(canvas);
                            //window.print(canvas);
                            //$log.log(canvas);
                        },
                        width: 595,
                        height: 842
                    });
                }catch(err){
                    $log.log(" html2canvas error: ", err);
                } 
            },2500);
        }*/
    });
    
    function setHeightApp(height) {
        if(height > 0) {
            wixService.Settings.resizeComponent({ height:height });
            $timeout(function(){
                calendarService.updatePerfectScrolling();
            },200); 
        }else{
            var h = (angular.element(constants.CALENDAR_ID).height() + 10)*1;
            
            if($scope.isMobile()){
                wixService.setHeight(h);
            }else {
                wixService.Settings.resizeComponent({ height:h });
            }
        }
    }
    
    $scope.$on('popoverIsReady', function(event, args) {
        $compile($('.webui-popover'))($scope); 
    });
    
    $scope.initLanguage = function(callback){
        function init(locale){
            $translate.use(locale).then(function() {
                callback();
            });
        }
        
        try {
            init($scope.settings.lang);
        }catch (err) {
            $log.log('err: ', err);
            init(constants.DEFAULT_LANGUAGE);
        }
    };
    
    $window.getCalendarTranslateByKey = $scope.getCalendarTranslateByKey = function(key){
        return calendarService.getTranslateByKey(key);
    };
    
    $scope.changeLanguage = function (key) {
        $translate.use(key);
    };
  
    $scope.getTranslateByKey = function(key){
        return $translate.instant(key,{},{},$scope.constants.curLocale);
    };
    
    $scope.isScrolling = function(){
        return (!$scope.scrollingTop);
    };
    
    /**
     * @name: getWinHeight
     * @param none
     * @returns (int) window (iframe) innerHeight
     * Called on $scope.$watch, reports height changes
     */
    $window.getWinHeight = $scope.getWinHeight = function () {
        $timeout (function(){
            var minHeight   = $scope.settings.showReviews ? 368 : 250;
            var $elm        = $scope.isMobile()?'#container':$window;
            var height      = Math.min(Math.max(angular.element($elm).height(),minHeight),1200);
            return height;    
        },200);
    };
    	
    /**
     * @name: getWinWidth
     * @param none
     * @returns (int) window (iframe) innerWidth
     * Called on $scope.$watch, reports width changes
     */
    $scope.getWinWidth = function () {
        return angular.element($window).width();
    };
     
    $scope.documentReady = function () {
        return $scope.inited;
    };
    
    $scope.initApp = function(){
        safeApply(function(){
            trackWixEvents();
            initCalendar($scope.settings); 
            $scope.inited = true;
        });
    };
    
}]).run(function($log,OBJECT_PARAMS,wixService) { //Start running the app 
   try {
        wixService.Performance.applicationLoaded();
    } catch (err) {
        console.log('Wix.Performance applicationLoaded: ', err);
    }
});