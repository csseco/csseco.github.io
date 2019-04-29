angular.module(objParams.appName).directive('dayName',["$timeout","$window","$log","OBJECT_PARAMS","$translate",function ($timeout,$window,$log,OBJECT_PARAMS,$translate) {
	return {
		restrict: 'AE',
        link: function (scope, element, attrs) {
            
        }			
	};
}]).directive('popoverSingleEvent',["$timeout","$window","$log","$translate", "$filter","$compile","$rootScope", function ($timeout,$window,$log,$translate, $filter,$compile,$rootScope) {
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            var elmScrolling  = '.event-data';
            //$log.log(attrs.eventstart);
            var eventData   =  scope.getSingleEventHTMLPopover(attrs.event,false);
            var placement   =  'auto'; 
            
            if(scope.isWeek()) {
                placement = ($(element).hasClass('fc-day-grid-event')) ? 'vertical' :  'horizontal';
            }else{
                placement = ( ($(element).hasClass('fc-not-end')  || $(element).hasClass('fc-not-start fc-end'))  && scope.isMonth())? 'vertical' :  placement;
            }
            
            $(element).webuiPopover('destroy').webuiPopover({
                closeable:false, //show close button "X"
                content: function (){
                    var html = '<div class="popover-text">'+eventData.html+'</div>';
                    return html;
                },
                padding:false,
                animation:'pop',
                cache: false,
                arrow:true, 
                width: 243,
                height:eventData.height.popoverHeight,
                placement: placement,
                onShow: function($element) {
                    $rootScope.$broadcast('popoverIsReady');
                    angular.element(elmScrolling).slimScroll({
                        height: eventData.height.scrollHeight+'px',
                        width: '220px;'
                    });       
                    //$log.log('placement:',placement, $(element).hasClass('fc-not-start fc-end'));
                },
                onHide: function($element) {
                    angular.element(elmScrolling).slimScroll('destroy');
                }
            });
        }
    };
}])
.directive('popoverEventList',["$timeout","$window","$log","$translate", "$filter","$compile","$rootScope", function ($timeout,$window,$log,$translate, $filter,$compile,$rootScope) {
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            var elmScrolling  = '.fc-event-list';
            var eventData     =  angular.element(attrs.segId).html();
            
            $(element).webuiPopover('destroy').webuiPopover({
                closeable:false, //show close button "X"
                content: function (){
                    var html = '<div class="popover-text">'+eventData+'</div>';
                    return html;
                },
                padding:false,
                animation:'pop',
                cache: false,
                arrow:true, 
                width: 243,
                height:230,
                onShow: function($element) {
                    angular.element(elmScrolling).slimScroll({
                        height: '248px',
                        width: '220px;'
                    });
                    $rootScope.$broadcast('popoverIsReady');
                },
                onHide: function($element) {
                    angular.element(elmScrolling).slimScroll('destroy');
                }
            });
        }
    };
}]);