$(function(){

	var pageController = function() {
		
		var flow = new Flow({unitWidth:230,container:document.getElementById("flow1")});
		var PAGE_CONTEXT = $({});
		
		var loader = (function(option) {
			
			var config,cache = [], recordNum = 0, cachedCount = 0, cachedExData = {}, loading = false;
		
			// default value
			var defaultConfig = {
				initDataNum:25, 	/* amount of first feching data*/
				increaseOffset:20,  /* get data when scroll */
				cacheSize:100 		/* amount of cache data */
			}
		
			config = $.extend({}, defaultConfig, option);
			
			function getLoadPromise(exData ,clearFetchFlag) {
					
				// if is loading return null 
				if(loading) {
					return null;
				}
				
				// clear cache and paging info
				if(clearFetchFlag && clearFetchFlag == true) {
					recordNum = 0;
					cachedCount = 0;
					cache = [];
					cachedExData = exData;
				} 
			
	
				if(recordNum == 0) {
					return requstProxy(0, config.initDataNum, cachedExData);
				} else {	
					return requstProxy(recordNum, config.increaseOffset, cachedExData);
				}

			}
			
			var requstProxy = function (from, offset, exData) {
			
				var promise = $.Deferred();
			
				// haven't cache enough data, get from server first	
				if(from + offset > cachedCount) {
					loading = true;
					$.getJSON('getPhotos', $.extend({}, {sn: from, on: config.cacheSize}, exData), function(data){
					
						// cache data
						cache = cache.concat(data);
						cachedCount += config.cacheSize;
						
						// resolve
						promise.resolve(getCachedData(from, offset));
						
						//
						recordNum += offset;
						loading = false;
					});
					
				} else {
					// get data from cache, resolve directly
					promise.resolve(getCachedData(from, offset));
					
					//
					recordNum += offset;
					loading = false;
				}
				
				function getCachedData(from, offset) {
					return cache.slice(from, from + offset);
				}
				return promise;
			}
			
			return {
				getLoadPromise:getLoadPromise
			}
			
		})();
		
		var tip = {
			loadingTip: "Loading ...",
			endOfDataTip: "No More Data",
			elm: document.getElementById("tipBar"),
			showLoading: function() {
				this.elm.innerHTML = this.loadingTip;
			},
			showEndOfDataTip: function() {
				this.elm.innerHTML = this.endOfDataTip;
			}					
		};
		
		PAGE_CONTEXT.on("fetchdata", function(event){
			var pms = loader.getLoadPromise();
			
			// null promise
			if(!pms) {
				return;
			}
			
			$.when(pms).done(function(data){
				if(data.length != 0) {
					tip.showLoading();
				} else {
					tip.showEndOfDataTip();
					return;
				}
				flow.loadData(data);
			})
			//var data = getFakeData(10);
			//flow.loadData(data);
		});
		
		
		PAGE_CONTEXT.on("fetchnewdata", function(event, data){
			var pms = loader.getLoadPromise({kw:data }, true);
			// null promise
			if(!pms) {
				return;
			}

			$.when(pms).done(function(data){
				if(data.length != 0) {
					tip.showLoading();
				} else {
					tip.showEndOfDataTip();
					return;
				}
				flow.reLoadData(data);
			})
			//var data = getFakeData(10);
			//flow.loadData(data);
		});
		
		PAGE_CONTEXT.trigger("fetchdata");
	
		function init() {
		
			// save search input and search btn
			var searchInput = document.getElementById("searchInput"),
				searchBtn = document.getElementById("searchBtn");
		
			var searchHandler = function(e) {
				// bind enter key for convenience
				if(e.type == "keyup" && e.keyCode != 13 ) {
					return;
				}
				PAGE_CONTEXT.trigger("fetchnewdata", searchInput.value);
			};
			
			var resizeDelayHandler = (function() {
			var timeId;	
				return function() {
					clearTimeout(timeId);
					timeId = setTimeout(function(){
						flow.adjustCol();
					},300);
				}
			})();
		
			var addEvent = function(element, type, handler) {
				if(element.addEventListener) {
					addEvent = function(element, type, handler) {
						element.addEventListener(type, handler, false);
					};
				} else if(element.attachEvent) {
					addEvent = function(element, type, handler) {
						element.attachEvent('on' + type, handler);
					};
				} else {
					addEvent = function(element, type, handler) {
						element['on' + type] = handler;
					};
				}
				addEvent(element, type, handler);
			};
		
	
			var scrollHandler = function(){
			  
				var scrollHeight = document.documentElement.scrollHeight,
					scrollTop = 0, offsetTop = 160;								
				if(Util.isWebKit()){
					scrollTop = document.body.scrollTop;
					
				} else {
					scrollTop = document.documentElement.scrollTop;;
				}
			  
				if(offsetTop + flow.getMinColHeight() < scrollTop + document.documentElement.clientHeight) {							  
					  PAGE_CONTEXT.trigger("fetchdata");							
				}					
			}

			addEvent(window, 'resize', resizeDelayHandler);
			addEvent(window, 'scroll', scrollHandler);
			addEvent(searchBtn, 'click', searchHandler);
			addEvent(searchInput, 'keyup', searchHandler);
			
		}
		
		
		return {
			init:init
		}
	}

	pageController().init();
});