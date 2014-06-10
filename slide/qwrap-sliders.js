(function (){
	//什么是NodeH？？？ NodeH.g又是什么？
	var getElementsByClass = NodeH.getElementsByClass;
	var g = NodeH.g;//？？？这个取到的是什么值
	var removeClass = NodeH.removeClass;
	var addClass = NodeH.addClass;	
    var getRect = NodeH.getRect;
    var getDocRect = DomU.getDocRect;
    var rectIntersect = DomU.rectIntersect;//返回交集的值。
	
	//这里我也不懂
	var easeOutStrong = function (p){
		return -((p -= 1) * p * p * p - 1);
	}	


	function ElSlide(el,opts){
		this.el = el;
		this.currentIndex = 0;
        this._render(opts);
		this.isRunning = false;
		this.autoplayPause = false;
		this._sliders = this._getSliders();		
		if (this.autoPlay){
			//?????
			this.auto(this.direction);	
		}
		if (this.pagenation){
			this.outPagenation();		
		}	
	}
	
	ElSlide.prototype.toNext = function(index){
		if (this.isRunning && this.clickLock!==undefined) {
			return false;
		}
		this.isRunning = true;
        var nodes = this.switchItems;		
		var deltaIdx  = this.step;
		if(typeof index == 'number'){
			var nextIndex = index;
		}else {
			var nextIndex = (this.currentIndex + deltaIdx + nodes.length) % nodes.length;
		}
		if(this.loopDirection == "alwaysOne"){
			for (var i = this.step-1 ; i >= 0  ; i--){
				var tmpStep = (nextIndex + i + nodes.length) % nodes.length;	
				insertAfter(nodes[tmpStep],nodes[this.currentIndex],tmpStep,this);
			}
		}else if (this.loopDirection == "single" && nodes[this.currentIndex].offsetLeft > nodes[nextIndex].offsetLeft ){
			for (var i = 0 ; i < this.step ; ++i){
				var tmpStep = (nextIndex + i + nodes.length) % nodes.length;	
				nodes[this.currentIndex].parentNode.appendChild(nodes[tmpStep]);
				this.container.scrollLeft = nodes[this.currentIndex].offsetLeft;				
			}
		}
		this.switchTo(nextIndex);
	};
	
	ElSlide.prototype.toPrevious = function(index){
		if (this.isRunning && this.clickLock!==undefined) {
			return false;
		}
		
		this.isRunning = true;
		
	    var nodes = this.switchItems;		
		var deltaIdx  = -1 * this.step;
		if(typeof index == 'number'){
			var nextIndex = index;
		}else {
			var nextIndex = (this.currentIndex + deltaIdx + nodes.length) % nodes.length;
	    }
	    if(this.loopDirection == "alwaysOne"){
    		for (var i = 0 ; i < this.step ; ++i){
				var tmpStep = (nextIndex + this.step - 1 - i + nodes.length) % nodes.length;
				if(nodes[this.currentIndex] == nodes[this.currentIndex].parentNode.firstChild){
					var second = (this.currentIndex - 0 + 1 ) % nodes.length;
					this.container.scrollLeft = this.switchItems[second].offsetLeft;
				}				
				nodes[this.currentIndex].parentNode.insertBefore(nodes[tmpStep] , nodes[this.currentIndex]);
			}
		}else if (this.loopDirection == "single" && nodes[this.currentIndex].offsetLeft < nodes[nextIndex].offsetLeft ){
		    for (var i = 0 ; i < this.step ; ++i){
				var tmpStep = (nextIndex + this.step - 1 - i + nodes.length) % nodes.length;
				var second = (this.currentIndex - 0 + 1 ) % nodes.length;
				this.container.scrollLeft = this.switchItems[second].offsetLeft;				
				nodes[this.currentIndex].parentNode.insertBefore(nodes[tmpStep] , nodes[this.currentIndex].parentNode.firstChild);
			} 
		}	
		
		this.switchTo(nextIndex);
	};	

    ElSlide.prototype._textareaPreload = function (){
        var nowIndex = this.currentIndex;
        var i = this.relatedIndex;

        var items = getElementsByClass(this.el , this.nodesClassName);
        for (var l = nowIndex ; l < i + this.step + this.lazyPre ; ++l){
            if (typeof(items[l]) != "undefined") {
                var x = items[l].firstChild ; 
                while (x.nodeType != 1) {
                    x=x.nextSibling;
                }

                if(x.tagName == 'TEXTAREA'){
                    items[l].innerHTML = x.value;
                }
            }
        }
    };
    ElSlide.prototype._imagePreload = function (){
        var nowIndex = this.currentIndex;
        var i = this.relatedIndex;

        var items =this.switchItems;
        for (var l = nowIndex ; l < i + this.step + this.lazyPre ; ++l){
            if (typeof(items[l]) != "undefined") {
               var img = W(items[l]).query('img[lazysrc]');
               img.attr('src', img.attr('lazysrc')).removeAttr('lazysrc')
            }
        }
    };	
	ElSlide.prototype._switchTo = function (i){ //liubao
		if(i > this.currentIndex){
			this.toNext(i);
		}else{
			this.toPrevious(i);
		}
	};
		
	ElSlide.prototype.switchTo = function (i , forceSwitch){
		this.relatedIndex = i;			

        switch(this.lazyLoadType){
            case "textarea":
                this._textareaPreload();
                break;    
            case "image":
            	this._imagePreload();
            	break;
            case "none":
            default:    
                break;
        }

		if(this.onbeforeswitch && this.onbeforeswitch()=== false) return false;	

		this._doAnimation(this.currentIndex , this.relatedIndex);
		this.currentIndex = this.relatedIndex;	
		if (this.pagenation){
			W(this.pageContainer).query(this.pagenationTag).filter(':nth-child(' + (this.currentIndex +1) + ')').addClass(this.currentPageCss).siblings().removeClass(this.currentPageCss);
		}
		if(this.onafterswitch) this.onafterswitch();		
	};
	ElSlide.prototype.outPagenation = function(){
		var pages = this.pageContainer.getElementsByTagName(this.pagenationTag);	

		var selectedLi = Math.floor(this.currentIndex / this.step);
		var self = this;

		for ( var i = 0 ; i < pages.length ; ++i){
			(function (i){
				W(pages[i]).on(self.handlerType,function(){						
					W(this).addClass(self.currentPageCss).siblings().removeClass(self.currentPageCss);
					self._switchTo(i * self.step , true);
				});
			}(i));
		}
	};
	
	ElSlide.prototype.auto = function(direction){
	    switch(direction){
			case "left":
			case "down":
				dir = 1;
				break;
			case "right":
			case "up":			
				dir = -1;
				break;			
		} 

		var self = this;	

		clearTimeout(self.playIntervalHandler);
		self.playIntervalHandler = setTimeout(function(){
		        if (self.autoplayPause == false && self._isInVisualField()){
					self.toNext();
				}
				self.auto(direction);
			} , 
		this.playInterval);
	};	

    ElSlide.prototype.switchAutoPlay = function(bool){
		this.autoplayPause = !bool;
		clearTimeout(self.playIntervalHandler);
		if(bool){
			this.auto(this.direction)
		}	
	};	

    ElSlide.prototype._isInVisualField = function(){
        var offsetMe = getRect(this.el); 
        var docRect = getDocRect();

        var visualFieldRect = {
            left :  docRect.scrollX , 
            right : docRect.width + docRect.scrollX ,
            top : docRect.scrollY,
            bottom : docRect.height + docRect.scrollY
        };    

        return !!rectIntersect(offsetMe , visualFieldRect); 
    };
	
	ElSlide.prototype._doAnimation = function (fromIdx , toIdx) {
		var startPosition = this.switchItems[fromIdx].offsetLeft;
		var endPosition = this.switchItems[toIdx].offsetLeft - this.initOffset ;
		
		var totalDistance = (endPosition | 0) -  (startPosition | 0) ; //总距离
		
		var doTimes = this.doTimes ;    //运作次数
		var totalTime = this.totalTime; //总运行时间，毫秒
		
		var interval = Math.ceil(totalTime / doTimes) ; //运行间隔
		
		var startTime = new Date();		

		
		try{
			window.clearInterval(this.animateHandler); //预防重复点击
		} catch(ex){
		
		}
		
		var self = this;	
		//self.switchAutoPlay(false);
		this.animateHandler = window.setInterval(function (){
			self._scrollAnim(startPosition , endPosition , startTime  , totalTime)
		} , interval);	
	};
	
	ElSlide.prototype._scrollAnim = function (startPosition , endPosition , startTime  , totalTime) {	
		var nowTime = new Date();
		var percent = (nowTime.getTime() - startTime.getTime()) / totalTime ; //运行百分比
		if (percent >= 1){
			percent = 1;
			window.clearInterval(this.animateHandler);
			this.isRunning = false;
			//this.switchAutoPlay(true);
		}
		
		var newLoc = startPosition + easeOutStrong(percent) * (endPosition - startPosition);
		this.container.scrollLeft = newLoc;	
	};	

	ElSlide.prototype._render = function(opts){
		this.direction = opts.direction || "left";
		this.autoPlay = opts.autoPlay || 0 ;
		this.step = opts.step || 1;
		this.onbeforeswitch = opts.onbeforeswitch;
		this.onafterswitch = opts.onafterswitch;
		this.playInterval = opts.playInterval || 2000 ;
		this.pagenation = opts.pagenation && 1;
		this.pageContainer = opts.pageContainer || "";		
		this.container = opts.container || "";
		this.loopDirection = opts.loopDirection || "alternate";
		this.currentPageCss = opts.currentPageCss || "selected";
		this.nodesClassName = opts.nodesClassName || "switch-content-item";
		this.doTimes = opts.doTimes || 36;
		this.totalTime = opts.totalTime || 2000;
        this.lazyLoadType = opts.lazyLoadType || "none";
        this.lazyPre = opts.lazyPre || 0;
        this.pagenationTag = opts.pagenationTag || "LI";
        this.handlerType = opts.handlerType || "click";
		
		this.switchItems = this._getSliders();
		this.initOffset = this.switchItems[0].offsetLeft;
		this.container.scrollLeft = 0;	
	};
	
	ElSlide.prototype._getSliders = function(){
	    return getElementsByClass( this.el , this.nodesClassName);		
    };	
	
	window.ElSlide = ElSlide;
}());
function insertAfter(newElement, targetElement,nextIndex,that){
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        // 如果最后的节点是目标元素，则直接添加。因为默认是最后
        parent.appendChild(newElement);
		that.container.scrollLeft = that.switchItems[that.currentIndex].offsetLeft;
    }
    else {
        parent.insertBefore(newElement, targetElement.nextSibling);
        //如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
    }
}