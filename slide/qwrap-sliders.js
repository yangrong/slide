(function (){
	//缩短作用域链，查找快，减少代码量
	var getElementsByClass = NodeH.getElementsByClass;
	var g = NodeH.g;//解包
	var removeClass = NodeH.removeClass;
	var addClass = NodeH.addClass;	
    var getRect = NodeH.getRect;//bottom,height,left,right,top,width
    var getDocRect = DomU.getDocRect;//width : w,height : h,scrollWidth : scrollW,scrollHeight : scrollH,scrollX : scrollX,scrollY : scrollY
    var rectIntersect = DomU.rectIntersect;//返回交集的值。
	
	//先减速后加速
	var easeOutStrong = function (p){
		return -((p -= 1) * p * p * p - 1);
	}	



	function ElSlide(el,opts){
		this.el = el;
		this.currentIndex = 0;
		//默认配置
        this._render(opts);
		this.isRunning = false;
		this.autoplayPause = false;
		this._sliders = this._getSliders();		
		if (this.autoPlay){
			this.auto(this.direction);	
		}
		if (this.pagenation){
			this.outPagenation();		
		}	
	}
	
	ElSlide.prototype.toNext = function(index){
		//this.isRunning?是不是检查是否在运动的按钮
		//this.clickLock?
		if (this.isRunning && this.clickLock!==undefined) {
			return false;
		}
		//打开正在运行的开关
		this.isRunning = true;

		//这里应该是运动的节点的集合类似 ul>li
        var nodes = this.switchItems;

        //???不知道这个干吗用的？
		var deltaIdx  = this.step;

		if(typeof index == 'number'){
			var nextIndex = index;
		}else {
			//？？这里的这个操作是不是取到从0到length-1的正确索引
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
				//这里是不是把当前节点的位置放父层元素的队尾。
				nodes[this.currentIndex].parentNode.appendChild(nodes[tmpStep]);
				//下面的这里，是不是类似，我的那个marginlefr的滚动？
				this.container.scrollLeft = nodes[this.currentIndex].offsetLeft;				
			}
		}
		//执行动画
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

	ElSlide.prototype._textareaPreload = function() {
		var nowIndex = this.currentIndex;
		var i = this.relatedIndex;
		//第二个参数是干嘛用的？
		var items = getElementsByClass(this.el, this.nodesClassName);
		for (var l = nowIndex; l < i + this.step + this.lazyPre; ++l) {
			if (typeof(items[l]) != "undefined") {
				var x = items[l].firstChild;
				while (x.nodeType != 1) {
					x = x.nextSibling;
				}

				if (x.tagName == 'TEXTAREA') {
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

		//判断是否加入lazyLoadType
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

        //这个是判断显示区域的宽度的
		if(this.onbeforeswitch && this.onbeforeswitch()=== false) return false;	
		//执行动画。
		this._doAnimation(this.currentIndex , this.relatedIndex);
		this.currentIndex = this.relatedIndex;	
		//处理导航的class切换
		if (this.pagenation){
			W(this.pageContainer).query(this.pagenationTag).filter(':nth-child(' + (this.currentIndex +1) + ')').addClass(this.currentPageCss).siblings().removeClass(this.currentPageCss);
		}
		//这个onafterswitch函数没有找到在哪里定义的
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
	//????

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
	//？？？
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
		//间隔
		this.step = opts.step || 1;
		//切换之前的函数
		this.onbeforeswitch = opts.onbeforeswitch;
		this.onafterswitch = opts.onafterswitch;
		this.playInterval = opts.playInterval || 2000 ;
		//??
		this.pagenation = opts.pagenation && 1;
		this.pageContainer = opts.pageContainer || "";		
		this.container = opts.container || "";
		//循环的方向
		this.loopDirection = opts.loopDirection || "alternate";
		//
		this.currentPageCss = opts.currentPageCss || "selected";
		//
		this.nodesClassName = opts.nodesClassName || "switch-content-item";
		//
		this.doTimes = opts.doTimes || 36;
		//动画本身的执行时间。
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