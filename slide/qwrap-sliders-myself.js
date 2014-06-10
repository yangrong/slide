(function(){
	function Slide(wraperBox,next,pre,ulcontent,opt){
	var _this=this;
 	this.wraperBox=wraperBox;
 	this.nextBtn=next;
 	this.preBtn=pre;
 	this.ulContent=ulcontent;
 	this.ulList=wraperBox.query('.list');
 	console.log(this.option);
 	Function.extend(this,this.option(opt));
 	this.t=null;
	}

	var lock= false;
	// 初始化设置
	Slide.prototype.option=function(options){ 
			this.option={
				speed:3000,
				autoplay:true,
				hasList:true
			};
			return Function.extend(this.option,options||{})
		};
	// 向下轮播函数
	Slide.prototype.domoveLeft = function() {
		var _this=this,
			cellwidth = _this.wraperBox.getRect().width,
			firstLi = _this.ulContent.query('li').first(),
			thisUl =this.ulContent;

			//这样写，为什么快速点击的时候，会导致，快速点击的时候，无法，快速切换，比如连击五下，缺切换到第二个li，是因为，dom元素删除添加到父层ul中，是在动画执行完，之后，回调的函数，所以如果是连击的话，第一次动画没有执行完，没有调用的回调函数，dom顺序没有发生变化，下面的动画就开始，
			// thisUl.animate({marginLeft: {from: '0px',to :'-' + cellwidth + 'px'}},500,function(){
			// 	firstLi.removeNode();
			// 	firstLi.appendTo(thisUl);
			// _this.wraperBox.query('ul').css('marginLeft', '0');
			// })
			
			//把回调函数的内容，写在animite对象外面，不作为执行函数，这样解决了，上面描述的问题，可以快速改变dom顺序，但是呢，第一次执行动画，动画就挂了，原因是，动画执行500毫秒，在执行过程中，已经将后面改变dom顺序函数调用，所以第一次执行的时候，整体ul在做marginleft：-1000px（整体向左移动的动画）的时候，第一个节点firstLi已经被移除，添加到ul最后面去了，然后重新设置了，marginleft，所以动画执行刚开始，第一个元素就已经是第二个li，
			
			console.log(lock);
			if(!lock){
				lock = true;
				thisUl.animate({marginLeft: {from: '0px',to :'-' + cellwidth + 'px'}},500,function(){
					firstLi.appendTo(thisUl);
					_this.wraperBox.query('ul').css('marginLeft', '0');
					lock = false;
				});
			}
			
			

			// lock = true;
			// thisUl.animate({marginLeft: {from: '0px',to :'-' + cellwidth + 'px'}},500, function(){
			// 	lock = false;
			// })  
			// 		firstLi.removeNode();
			// 	firstLi.appendTo(thisUl);
			// _this.wraperBox.query('ul').css('marginLeft', '0');
			
	},
	// 向上轮播函数
	Slide.prototype.domoveRight = function() {
		
		var _this = this,
			cellwidth = _this.wraperBox.getRect().width,
			lastLi = _this.ulContent.query('li').last(),

			allList = _this.ulList.query('li'),
			onIndex = _this.findLiIndex(allList, 'on'),
			curlist = _this.wraperBox.query('.list .on');
		// console.log(_this.ulContent.html());
		// console.log(lastLi)
		lastLi.removeNode();
		// console.log(_this.ulContent,lastLi);
		_this.ulContent.prepend(lastLi);
		_this.ulContent.css('marginLeft', '-' + cellwidth + 'px');

		_this.ulContent.animate({
			marginLeft: {
				from: '-' + cellwidth + 'px',
				to: '0px'
			}
		}, 500);
		
	}
	// list菜单的轮播
	Slide.prototype.listMove = function(direction) {

		var allList = this.ulList.query('li'),
			curlist = this.wraperBox.query('.list .on'),
			onIndex = this.findLiIndex(allList, 'on');
		curlist.removeClass('on');

		if (direction === 'right') {
			if (onIndex != allList.length - 1) {
				curlist.nextSibling('li').addClass('on');
			} else {
				allList.first().addClass('on');
			}
		} else if (direction === 'left') {
			if (onIndex != 0) {
				curlist.previousSibling('li').addClass('on');
			} else {
				this.ulList.query('li').last().addClass('on');
			}
		}
	}

	// 执行循环轮播
	Slide.prototype.doSlide=function(){
		var _this=this;
		this.t=setInterval(function(){
			_this.domoveLeft();
			_this.listMove('right');
		},_this.option.speed);

	};
	// 点击按钮向上翻
	Slide.prototype.preMove = function() {
		var _this=this;
		_this.preBtn.on('click',function(){
			_this.domoveRight();
			_this.listMove('left');

		})

	};
	// 点击按钮向下翻
	Slide.prototype.nextMove=function(){
		var _this=this;
		this.nextBtn.on('click',function(){
			_this.domoveLeft();
			_this.listMove('right');
		})
		
	};
	// 通过list菜单选择一切换多个轮播
	Slide.prototype.moreMove = function(distance) {
		var _this = this;
		if (distance == 0) {
			return;
		} else if (distance > 0) {
			for (var i = 0; i < distance; i++) {
				_this.domoveLeft();
			};
		} else {
			for (var i = 0; i < Math.abs(distance); i++) {
				_this.domoveRight();
			};

		}
	}
	// 找到对应类名的在父层的index索引值
	Slide.prototype.findLiIndex=function(obj,className){
		for (var i = 0; i<obj.length; i++) {
			if(W(obj[i]).hasClass(className)){
				return i;
			}
		}
	};
	// 鼠标移入停止动画
	Slide.prototype.mouseenter=function(){
		var _this=this;
		this.wraperBox.on('mouseenter',function(){
 			clearInterval(_this.t);
		})
	};
	// 鼠标移出开始动画
	Slide.prototype.mouseout=function(){
		var _this=this;
		this.wraperBox.on('mouseleave',function(){
 			_this.t=setInterval(function(){
 			_this.domoveLeft();
			_this.listMove('right');

 		},_this.option.speed);
		})
	};
	// 动态生成菜单列表个数
	Slide.prototype.createList=function(){
		var liLength=this.wraperBox.query('ul li').length;
		 for (var i =0; i < liLength; i++) {
		 	var createLi=Dom.createElement('li');
		 	W(createLi).appendTo(this.ulList);
		 };
		 this.ulList.query('li:first-child').addClass('on');
	};
	// 鼠标移入菜单列表页
	Slide.prototype.listMouseenter = function() {
		var _this=this;
		_this.ulList.delegate('>li', 'mouseenter', function() {
			var allList =_this.ulList.query('li'),
				onIndex =_this.findLiIndex(allList, 'on');
			_this.ulList.query('.on').removeClass('on');
			W(this).addClass('now-mouseenter').addClass('on');
			var nowIndex=_this.findLiIndex(allList, 'now-mouseenter'),
				distance=nowIndex-onIndex;
				console.log(distance);
				_this.moreMove(distance);
			W(this).removeClass('now-mouseenter');
		});
	}
	// 执行函数
	Slide.prototype.init=function(){
		this.createList();
		if(this.option.autoplay){
			// this.doSlide();
		}
		// this.mouseenter();
		// this.mouseout();
		this.nextMove();
		this.preMove();
		this.listMouseenter();
	};
	window.Slide = Slide;
}());