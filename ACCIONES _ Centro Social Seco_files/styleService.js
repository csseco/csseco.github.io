angular.module(objParams.appName).service("styleService",["OBJECT_PARAMS","$timeout","$log",function(OBJECT_PARAMS,$timeout,$log){
	var constants = OBJECT_PARAMS.constants;
	var settings,styleParams,css,isMobile;
	var design = OBJECT_PARAMS.design;
	
	function initParams(aSettings,aStyleParams,aisMobile){
		try{
		    isMobile       = aisMobile,
		    settings       = aSettings,
	        styleParams    = angular.extend({colors:[],fonts:[]},aStyleParams);
	        css            = '';
	   }catch(e){
	   		$log.info(e);
	   }
	}
	
	function getValue(obj)	{
		if (angular.isObject(obj) && obj.hasOwnProperty('value')) return obj.value;
		return obj;	
	}
	
	function jointCSS(){
		var css = [];
		
		var buttonsColor      = angular.isObject(styleParams.colors[design.buttons.color.name]) ? getValue(styleParams.colors[design.buttons.color.name]) :  getValue(Wix.Styles.getColorByreference(design.buttons.color.value)) ;
		var datesColor        = angular.isObject(styleParams.colors[design.dates.color.name]) ? getValue(styleParams.colors[design.dates.color.name]) :  getValue(Wix.Styles.getColorByreference(design.dates.color.value)) ;
		var bgBox             = angular.isObject(styleParams.colors[design.box.color.name]) ? getValue(styleParams.colors[design.box.color.name]) :  getValue(Wix.Styles.getColorByreference(design.box.color.value)) ;
		var popupTextColor    = angular.isObject(styleParams.colors[design.eventsPopupText.color.name]) ? getValue(styleParams.colors[design.eventsPopupText.color.name]) :  getValue(Wix.Styles.getColorByreference(design.eventsPopupText.color.value)) ;
		var popupScrollBar    = angular.isObject(styleParams.colors[design.eventsPopupDetails.color.name]) ? getValue(styleParams.colors[design.eventsPopupDetails.color.name]) :  getValue(Wix.Styles.getColorByreference(design.eventsPopupDetails.color.value)) ;
		
		datesColor    = tinycolor(datesColor);
		datesColor    = (datesColor.isLight()) ? tinycolor(datesColor).darken(10).toString() : tinycolor(datesColor).brighten(10).toString();
		
		bgBox             = tinycolor(bgBox);
        bgBox             = (bgBox.isLight()) ? tinycolor(bgBox).darken(20).toString() : tinycolor(bgBox).brighten(10).toString();
        
        popupScrollBar    = tinycolor(popupScrollBar);
        popupScrollBar    = (popupScrollBar.isLight()) ? tinycolor(popupScrollBar).darken(20).toString() : tinycolor(popupScrollBar).brighten(10).toString();
            
        buttonsColor   = tinycolor(buttonsColor);
        //$log.log('Before buttonsColor',buttonsColor);
        buttonsColor   = (buttonsColor.isLight()) ? '#000' : '#fff';
        //$log.log('After buttonsColor',buttonsColor);
        
		//css.push('.copy-event','{','background-color',':',datesColor,';','}');
		//css.push('.slimScrollBar','{','background',':',popupScrollBar,';','}'); 
		css.push('.fc-mobileView-today, .fc-mobileView-today * ,.table-row.fc-agendaList-dayHeader.fc-today ','{','background-color',':',bgBox,';','}');
		css.push('.fc-more-cell > div a.fc-more, div.badge a.fc-more','{','color',':',buttonsColor,';','}');
		
		//$log.log('before popupTextColor', popupTextColor);
		popupTextColor = tinycolor (popupTextColor);
		popupTextColor.setAlpha(1);
		//$log.log('after popupTextColor', popupTextColor.toHex());
		css.push('.webui-popover', '{','color',':',popupTextColor,';','}');
		
		return css;		
	}
	
	function styleMobile() {
		var css       = jointCSS();
		var finalCSS  = css.join('');
		return finalCSS;		
	}
	function styleWidget() {
		var css       = jointCSS();
		var finalCSS  = css.join('');
		
		
		return finalCSS;
	}
    
    function applyCssStyle(){
        $timeout(function(){
            //adjustHeight();
        },100);
    }

    this.applyLayoutStyle = function(aSettings,aStyleParams, aisMobile) {
   		initParams(aSettings, aStyleParams,aisMobile);
   		//console.log('settings.layout: ',settings.layout);
   		
        var styleCSS   = '',
            styleId    = 'myStyleInject'+settings.layout;
       
        
        styleCSS = (isMobile) ? styleMobile() : styleWidget();
        angular.element('#'+styleId).remove();
        angular.element('<style type="text/css" id="'+styleId+'">'+styleCSS+'</style>').appendTo('head');
        applyCssStyle();
    };
}]);