(function() {
    "use strict";
    var FC      = $.fullCalendar;   // a reference to FullCalendar's root namespace
    var View    = FC.View;          // the class that all views must inherit from
    var agendaListView;             // our subclass

    agendaListView = View.extend({ // make a subclass of View
        computeRange: function(date) {
           
            var intervalDuration = moment.duration(this.opt('duration') || this.constructor.duration || {
                months: 1
            });
            
            var intervalUnit    = 'month';
            var intervalStart   = date.clone().startOf(intervalUnit);
            var intervalEnd     = intervalStart.clone().add(1,'months');
            var start           = intervalStart.clone(),
                end             = intervalEnd.clone();
            
            var daysInMonth     = start.clone().daysInMonth(),//count number of days in this month
                pm              = moment.tz(this.opt('timezone')).format('Z'),
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
                scrollClass: '.fc-view.fc-agendaList-view',
                daysInMonth: daysInMonth,
                timezoneOffset: timezoneOffset,
                locale:this.calendar.options.lang
            };
        },
        
        initialize: function() {
            // called once when the view is instantiated, when the user switches to the view.
            // initialize member variables or do other setup tasks.
            View.prototype.initialize.apply(this, arguments);
        },
        getDateByLocale: function(date,format){
            try {
                var d = moment(date).locale(this.locale).format(format);
                return d;
            }catch(err) {
                //console.trace(date,format,this.locale);
                return date;
            }
        },
        handleAllDayEvent: function (arrEvents,event){
            var start  = moment.max(event.start,this.start).date()-1;
            
            for(var j=start; j<this.daysInMonth; j++){
                var day  = this.start.clone().add(j,'days');
                
                if(day.isSameOrAfter(event.start,'day') && day.isBefore(event.end,'day')){
                    arrEvents[j].unshift(Object.create(event));
                }
                if (day.isSameOrAfter(event.end,'day')) break;
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
            if(diffDays > 1) {
                var eventCurrentDay, eventCurrentDayTZ;
                    
                for(var i=0; i<=diffDays; i++){
                    eventCurrentDay     = startEvent.clone().add(i,'days');
                    eventCurrentDayTZ   = eventCurrentDay;
                    
                    if (eventCurrentDayTZ.isSame(this.start,'month') && !eventCurrentDayTZ.isAfter(endEvent, 'day')){
                        event.multiDayEvent = true;
                        var day  = eventCurrentDay.date();
                        
                        arrEvents[day-1] = arrEvents[day-1]||[];
                        arrEvents[day-1].push(event);
                        arrEvents[day-1].sort(this.compareDates);
                    }
                }
            }else{
                if (startEvent.isSame(this.start,'month')){
                    var day = startEvent.date();
                    arrEvents[day-1].push(event);
                    arrEvents[day-1].sort(this.compareDates); //sort events in current day
                }
            }
        }, 
        render: function() { },

        computeTitle: function() {
            return this.start.format(this.opt('titleFormat'));
        },
        setHeight: function(height, isAuto) {
            // responsible for adjusting the pixel-height of the view. if isAuto is true, the
            // view may be its natural height, and `height` becomes merely a suggestion.
            this.el.height(height);
            
            try{
                $(this.scrollClass).perfectScrollbar('destroy');
            }catch(err){
                
            }
            
            $(this.scrollClass).perfectScrollbar({ wheelPropagation: true,useBothWheelAxes:true,scrollXMarginOffset:10 });
            View.prototype.setHeight.apply(this, arguments);
            
        },        
        renderEventTime : function(event, day){
            var arrTimes  = getEventTimeText(event,false);
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
        renderBodyHtml: function() {
            return  $('<div class="table"></div>');
        },
        renderDayBlockHtml : function(dayId, day){
            var classes = this.getDayClasses (day);
            
            return '<div class="table-row fc-agendaList-dayHeader ui-widget-header ' + classes.join(' ') + '" >' +
                        '<div class="table-cell-left">' +
                            '<div class="fc-curDate">'+
                                '<span class="fc-agendaList-date">'+ day.format('DD') +'</span>' +
                                '<span class="fc-agendaList-day">'+ this.getDateByLocale(day, 'dddd')+'</span>' +
                             '</div>'+   
                        '</div>'+
                        '<div class="table-cell-middle"></div>' +
                        '<div class="table-cell-right"><ul class="list-group" id="'+dayId+'">';
        },
        renderEventBlockHtml: function(event,index, day){
            var cb = 'eventData'+index++;
            //console.log('renderEventBlockHtml:',day);
            return '<li class="list-group-item">'+
                        '<input type="checkbox" id="'+cb+'"/>'+
                        '<label for="'+cb+'">'+
                            '<span class="fc-event-time">'+ this.renderEventTime(event,day)+'</span>'+
                            '<span class="fc-event-title">'+this.renderEventTitle(event)+'</span>' +
                        '</label>' +
                        '<ul class="eventData" ng-bind-html="getAgendaEventHTML(\''+event.uniqeId+'\') | html"></ul>' +
                    '</li>';
        },
        renderNoUpcomingEventsHTML:function(){
            return  '<div class="table-row"> ' + 
                        '<div class="fc-cell-empty-events" ng-bind="getCalendarTranslateByKey(\'event_no_upcoming_events_month\')"></div>' +
                     '</div>' ;
        },
        compareDates : function(a,b){ // for .sort()
            var dateA = new Date(a.start).getTime();
            var dateB = new Date(b.start).getTime();
            
            return dateA > dateB ? 1 : -1; 
        },
        getDayClasses: function(date) {
            var view    = this.view;
            var today   = this.calendar.getNow();
            var classes = [ 'fc-' + (date.locale('en').format('ddd')).toLowerCase()];
           
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
        renderEvents: function(events) {
            var tbody       = this.renderBodyHtml();
            //this.scrollerEl = this.el.addClass('fc-scroller');
            
            this.el.html('').append('<div class="fc-agendaList"></div>').children().append(tbody);
            
            var arrEvents       = [],
                arrDayEvents    = [],
                index           = 0;
            
            for(var i=0; i<this.daysInMonth; i++){
                arrEvents[i]    = [];
                arrDayEvents[i] = [];
            }
            
            // reponsible for rendering the given Event Objects
            var copyEvents      = events.slice().reverse(); //copy and reverse so we can modify while looping
            var eventCount      = copyEvents.length;
            var isFoundEvents   = false;
            
            if(eventCount > 0){
                for (i=0; i<eventCount; i++) {
                    var event     = Object.create(copyEvents[i]);
                    event.isStart = event.isEnd = event.multiDayEvent = false;
                    (event.allDay) ? this.handleAllDayEvent(arrDayEvents,event) : this.handleTimedEvent(arrEvents,event);
                }
                 
                var arrLen = arrEvents.length;
                var i,k, day, len, html = '',lengthAllday;
                
                // sort all day events by title
                for (i = 0; i < arrLen; i++) {
                    arrDayEvents[i] = arrDayEvents[i].sort(function(item1,item2){
                        return item2.title.localeCompare(item1.title);
                    });
                }
                
                for (i = 0, k=0; i < arrLen; i++) {
                    len             = (arrEvents[i])    ? arrEvents[i].length    : 0;
                    lengthAllday    = (arrDayEvents[i]) ? arrDayEvents[i].length : 0;
                    
                    if(len > 0  || lengthAllday > 0) {
                        isFoundEvents   = true;
                        day             = this.start.clone().add(i,"days");
                        
                        if(lengthAllday > 0) { // add all day events in the first
                            for(var k=0; k < lengthAllday; k++){
                                arrEvents[i].unshift(arrDayEvents[i][k]);
                                len++;
                            }
                        }
                         
                        for (var j=0; j<len; j++){
                            if (j==0) {            
                                var dayId = 'day'+i;
                                html += this.renderDayBlockHtml(dayId, day);
                            }
                            
                            event = arrEvents[i][j];
                            html += this.renderEventBlockHtml(event,index++,day);
                        }
                        if(j!=0) html += '</ul></div></div><div class="row-separator" id="row-separator'+index+'"></div>';
                    }
                }
            }
            
            html = (!isFoundEvents) ? this.renderNoUpcomingEventsHTML() : html ;
            
            tbody.append(html);
            $("#row-separator"+index).remove();
            
            this.updateHeight(); 
            View.prototype.renderEvents.apply(this, arguments);
        },
        destroyEvents: function() { },
        renderSelection: function(range) {
            // accepts a {start,end} object made of Moments, and must render the selection
            View.prototype.renderSelection.apply(this, arguments);
        },
        destroySelection: function() {
            // responsible for undoing everything in renderSelection
            View.prototype.destroySelection.apply(this, arguments);
        }
    });
    
    FC.views.agendaList = agendaListView; // register our class with the view system
})();