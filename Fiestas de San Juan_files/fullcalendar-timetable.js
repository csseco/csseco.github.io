(function() {
    "use strict";
    var FC      = $.fullCalendar;   // a reference to FullCalendar's root namespace
    var View    = FC.View;          // the class that all views must inherit from
    var timetableView;             // our subclass

    timetableView = View.extend({ // make a subclass of View
        getDayID: function(day){
            var dayId = 0 ;
            switch(day) {
                case "sunday":      dayId = 0; break;
                case "monday":      dayId = 1; break;
                case "tuesday":     dayId = 2; break;
                case "wednesday":   dayId = 3; break;
                case "thursday":    dayId = 4; break;
                case "friday":      dayId = 5; break;
                case "saturday":    dayId = 6; break;
            }
            return dayId;
        },
        computeRange: function(date) {
           
            var intervalDuration = moment.duration(this.opt('duration') || this.constructor.duration || {
                weeks: 1
            });
            
            var intervalUnit    = 'week';
            var intervalStart   = date.clone().startOf(intervalUnit);
            var intervalEnd     = intervalStart.clone().add(1,'weeks');
            var start, end;
            //console.log(intervalStart, intervalEnd,intervalDuration);
            
            // normalize the range's time-ambiguity
            intervalStart.stripTime();
            intervalEnd.stripTime();
            
            start   = intervalStart.clone();
            start   = this.skipHiddenDays(start);
            end     = intervalEnd.clone();
            end     = this.skipHiddenDays(end, -1, true); // exclusively move backwards
            
            //console.log(start,end);
            var diffInDays      = end.diff(start, 'days'); // 7 day
            var daysInMonth     = start.clone().daysInMonth();//count number of days in this month
            var hiddenDays      = this.opt('hiddenDays') ;
            var arrShowDates    = [];
            
            //console.log('hiddenDays:',hiddenDays);
            for(var i=0; i<diffInDays;i++){
                var day     = moment(start.clone().add(i,'days')).locale("en");
                var dayName = day.format('dddd').toLowerCase();
                var dayId   = this.getDayID(dayName);
                
                if( !($.inArray(dayId, hiddenDays)>-1) ) {
                    arrShowDates.push(day.format('YYYY-MM-DD'));        
                }
            }
            
            //separate the events into all-day and timed
            var pm              = moment.tz(this.opt('timezone')).format('Z'),
                zone            = moment.tz.zone(this.opt('timezone')),
                timezoneOffset  = zone.parse(Date(start)) || 0; // 480
                
            timezoneOffset = (pm.charAt(0) =='-')? timezoneOffset*-1: timezoneOffset*1;
            
            return {
                intervalDuration: intervalDuration,
                intervalUnit: intervalUnit,
                intervalStart: intervalStart,
                intervalEnd: intervalEnd,
                start: start,
                end: end,
                diffInDays: diffInDays,
                daysInMonth: daysInMonth,
                timezoneOffset: timezoneOffset,
                arrShowDates: arrShowDates,
                scrollClass: '.fc-timetable-scroll',
                isScroller : false ,
                locale:   this.calendar.options.lang
            };
        },
        
        initialize: function() {
            // called once when the view is instantiated, when the user switches to the view.
            // initialize member variables or do other setup tasks.
            //console.log(this,arguments);
            View.prototype.initialize.apply(this, arguments);
        },
        getDateByLocale: function(date,format){
            return moment(date).locale(this.locale).format(format);
        },
        render: function() { },
        htmlEscape: function (s) {
            return (s + '').replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&#039;')
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '<br />');
        },
        computeTitle: function() {
            var title;
            if(this.start.clone().isSame(this.end,'month')) {
                title = this.getDateByLocale(this.start, 'DD') ;
            }else if(this.start.clone().isSame(this.end,'year')) {
                title = this.getDateByLocale(this.start, 'DD MMM') ;
            }else{
                title = this.getDateByLocale(this.start, 'DD MMM YYYY'); 
            }
            
            title += " - " + this.getDateByLocale(this.start.clone().add(6,'days'),'DD MMM YYYY');
            //console.log('title:',title);
            return title;
        },
        setHeight: function(height, isAuto) {
            // responsible for adjusting the pixel-height of the view. if isAuto is true, the
            // view may be its natural height, and `height` becomes merely a suggestion.
            this.el.height(height);
            
            var toolbarHeight   = this.el.find('.fc-header.fc-toolbar').height() || 36;
            var headHeight      = this.el.find('.fc-header.table').height() || 111;
            
            this.el.find(this.scrollClass).height(height - toolbarHeight - headHeight);
            //console.log('toolbarHeight:', toolbarHeight , 'headHeight:',headHeight);
            
            try{
                $(this.scrollClass).perfectScrollbar('destroy');
            }catch(err){
                
            }
            
            $(this.scrollClass).perfectScrollbar({ wheelPropagation: true,useBothWheelAxes:true,scrollXMarginOffset:10 });
            View.prototype.setHeight.apply(this, arguments);
        },
        renderEventTime : function(event,day){
            var arrTimes  = getEventTimeText(event,true);
            var eventTime = event.allDay ?  arrTimes.allDayText : arrTimes.fullTime ;
            
            if(event.multiDayEvent && !event.allDay){
                var startEvent  = event.start.clone();
                var endEvent    = event.end.clone();
                var isStart     = (day.clone().isSame(startEvent,'day'));
                var isEnd       = (day.clone().isSame(endEvent,'day'));
                var startTime   = startEvent.format(this.calendar.options.axisFormat);
                var endTime     = endEvent.format(this.calendar.options.axisFormat);
                
                if(isStart) {
                    eventTime = startTime + ' - ' + this.getDateByLocale(event.end, 'DD MMM ') + endTime;
                }else if(isEnd){
                    eventTime = this.getDateByLocale(event.start, 'DD MMM ') + startTime+' - '+ endTime ;
                }else{
                    eventTime =  arrTimes.fullTime;
                }
            }
            
            return eventTime;
        },
        renderEventTitle: function(event){
            return eventTitle(event);    
        },
        renderHeadHtml: function(){
            var date, format,classes ;
            
            var  html = '<div class="fc-header table">'  +
                            '<div class="table-row">';
            
            for(var i=0; i<this.arrShowDates.length; i++){
                //console.log('this.calendar.lang:',this.calendar.options.lang);
                date    = moment(this.arrShowDates[i]);
                format  = this.arrShowDates[i];
                classes = this.getDayClasses(date);
                
                html +=     '<div class="table-cell fc-day-header fc-widget-header ' + classes.join(' ')  + '"  data-date="'+format+'">' +
                                '<span>'+date.format('DD')+'</span>' +
                                '<span class="fc-day-name" data-shortname="'+this.htmlEscape(this.getDateByLocale(date,'ddd'))+'" data-longname="'+this.htmlEscape(this.getDateByLocale(date,'dddd'))+'"></span>' +
                            '</div>';
            }

            html +=    '</div>'+
                    '</div>'; 
                   
            return html;             
        }, 
        renderNoUpcomingEventsHTML: function (){
            return  '<div class="fc-empty-events" ng-bind="getCalendarTranslateByKey(\'event_no_upcoming_events_week\')"></div>';
        },
        // Computes HTML classNames for a single-day element
        getDayClasses: function(date) {
            var view    = this.view;
            var today   = this.calendar.getNow();
            var classes = ['fc-' + (date.locale('en').format('ddd')).toLowerCase()];
    
            if (date.isSame(today, 'day')) {
                classes.push( 'fc-today');
            }
            else if (date < today) {
                classes.push('fc-past');
            }
            else {
                classes.push('fc-future');
            }
    
            return classes;
        },
    
        renderEventBlockHtml: function(event,day){
            var classes = this.getDayClasses(day);
            var html = '<div class="table-cell fc-day fc-widget-content ' + classes.join(' ')  + '">';
            
            if(typeof event !== "undefined"){
                html += '<div class="fc-event" popover-single-event data-event="'+event.uniqeId+'">' +
                            '<span class="fc-event-time" ng-clamp="2">'+ this.renderEventTime(event,day)+ '</span>'+
                            '<span class="fc-event-title" ng-clamp="1">'+this.renderEventTitle(event) +'</span>' +
                            ((event.description ) 
                                ? '<span class="fc-event-description" ng-clamp="1">'+event.description+'</span>'  
                                : '' 
                            ) +
                        '</div>';
             }
             
             html += '</div>' ;
             
             return html;
        },
        compareDates : function(a,b){ // for .sort()
            var dateA = new Date(a.start).getTime();
            var dateB = new Date(b.start).getTime();
            return dateA > dateB ? 1 : -1; 
        },
        
        handleAllDayEvent: function (arrEvents,event){
            for(var i=0; i < this.arrShowDates.length; i++){
                var day      = this.start.clone().add(i,'days');
                var format   = day.format("YYYY-MM-DD");
                //console.log(this.start, day, format);
                if( (day.isSameOrAfter(event.start,'day') && day.isBefore(event.end,'day'))){
                    arrEvents[format] = arrEvents[format]||[];
                    arrEvents[format].push(Object.create(event));
                }
            }
        },
        
        handleTimedEvent : function(arrEvents,event){
            var startEvent  = event.start.clone();
            var endEvent    = (event.end) ? event.end.clone() : startEvent;
            var diffDays    = Math.abs(startEvent.diff(endEvent, 'days'));
            
            if(diffDays <= 1 ) {
                var isSameDay = startEvent.isSame(endEvent, 'day');
                if(!isSameDay){
                    diffDays = 2;
                }
            }
                     
            //multiple day event - not all day event
            if(diffDays > 0) {
                var eventCurrentDay, eventCurrentDayTZ;
                for(var i=0; i<= diffDays; i++){
                    
                    var eventCurrentDay     = startEvent.clone().add(i,'days');
                        eventCurrentDayTZ   = eventCurrentDay;
                    
                    var  day = eventCurrentDay.format("YYYY-MM-DD");
                    
                    if(($.inArray(day, this.arrShowDates) > -1) && !eventCurrentDayTZ.isAfter(endEvent, 'day')) {
                        event.multiDayEvent = true;
                        arrEvents[day] = arrEvents[day]||[];
                        arrEvents[day].push(event);
                        arrEvents[day].sort(this.compareDates);
                    }
                }
            }else{
                var startDay  = startEvent.format("YYYY-MM-DD");
                
                if($.inArray(startDay, this.arrShowDates) > -1) {
                    
                    arrEvents[startDay] = arrEvents[startDay]||[];
                    arrEvents[startDay].push(event);
                    arrEvents[startDay].sort(this.compareDates);
                }
            }
            //console.log('handleTimedEvent arrEvents:',arrEvents);
        }, 
        
        renderEvents: function(events) {
            var arrEvents       = {},
                arrDayEvents    = {},
                index           = 0;
            
            // reponsible for rendering the given Event Objects
            var copyEvents = events.slice().reverse(); //copy and reverse so we can modify while looping
            var eventCount = copyEvents.length;
            
            if(eventCount > 0){
                for (i=0; i<eventCount; i++) {
                    var event       = Object.create(copyEvents[i]),
                        arrEventsR  = [];
                    
                    event.isStart = event.isEnd = event.multiDayEvent = false;
                    (event.allDay) ? this.handleAllDayEvent(arrDayEvents,event) : this.handleTimedEvent(arrEvents,event);
                }
                
                var cntRows = 0;
                var cntCol  = this.arrShowDates.length || 0;
                 
                //Find cntRows & add all-day events 
                var arrEventsLength = arrEvents.length || 0;
                var foundEvents = false;
                
                for (var arr in arrEvents){
                    foundEvents = true;
                    if( typeof arrDayEvents[arr] !== "undefined"  && arrDayEvents[arr].length > 0) { //insert all days events
                        for(var k=0; k<arrDayEvents[arr].length; k++) {
                            arrEvents[arr].unshift(arrDayEvents[arr][k]);
                        }
                    }
                    if (arrEvents[arr].length>cntRows) cntRows = arrEvents[arr].length;
                }
                
                if(!foundEvents ){
                    arrEvents = [];
                    for (var arr in arrDayEvents){
                        for(var k=0; k< arrDayEvents[arr].length; k++){
                            arrEvents[arr] = arrEvents[arr] || []; 
                            arrEvents[arr].push(arrDayEvents[arr][k]);
                        }
                        
                        if (arrEvents[arr].length > cntRows) cntRows = arrEvents[arr].length;
                    }
                }
                
                var bodyHtml = this.renderHeadHtml() + '<div class="'+this.scrollClass.replace('.','')+'"><div class="fc-body table fc-container-events">';
                
                for (var i=0; i < cntRows; i++) {
                    bodyHtml += '<div class="table-row">';
                    for (var k=0; k < cntCol; k++) {
                        var date    = moment(this.arrShowDates[k]);
                        var format  = this.arrShowDates[k];
                        var event   = (arrEvents[format]) ? arrEvents[format][i] : undefined;
                        
                        bodyHtml += this.renderEventBlockHtml(event, date) ;
                    }
                    bodyHtml +=  '</div> <!-- table-row -->' ;
                }
                        
                bodyHtml +=  '</div> </div> <!-- table -->' ;
                if(cntRows == 0 ) {
                    bodyHtml = this.renderNoUpcomingEventsHTML();
                }

            }else{
                bodyHtml = this.renderNoUpcomingEventsHTML();
            }
            
            var tbody       = $('<div  class="fc-view-container-in"/>');
            //this.scrollerEl = this.el.addClass('fc-scroller');

            this.el.html('<div />').children().append(tbody);
            tbody.append(bodyHtml);
            this.scrollerEl = this.el.children().find(this.scrollClass);
            
            //console.log(index, arrEvents.length, arrEvents);
            this.updateHeight(); 
            View.prototype.renderEvents.apply(this, arguments);
        },
        destroyEvents: function() {},
        renderSelection: function(range) {
            //accepts a {start,end} object made of Moments, and must render the selection
            View.prototype.renderSelection.apply(this, arguments);
        },
        destroySelection: function() {
            //responsible for undoing everything in renderSelection
            View.prototype.destroySelection.apply(this, arguments);
        }
    });
    FC.views.timetable = timetableView; // register our class with the view system
})();