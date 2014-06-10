(function() {
		function Slide(wraperBox, next, pre, ulcontent, opt) {
			this.wraperBox = wraperBox;
			this.nextBtn = next;
			this.preBtn = pre;
			// 存放图片的ul
			this.ulContent = ulcontent;
			// 存放初始化位置顺序的li
			this.ulContentLi = ulcontent.query('li');
			// 存放菜单页的ul
			this.ulList = wraperBox.query('.list');
			this.navli = this.ulList.query('li')
			Object.mix(this, this.option(opt));
			this.t = null;

			//全局要用的参数
			this.cellwidth = wraperBox.getRect().width;
		}
	// 初始化设置
	Slide.prototype.option=function(options){ 
			this.option={
				//记录第一张聚焦的图片在哪里。
				fouseNum:0,
				speed:3000,
				autoplay:true,
				hasList:true,
				firstShow:0
			};
			return  Object.mix(this.option,options||{})
		};
	// 调用图片轮播函数
	Slide.prototype.rightMove = function(index) {
		if (index < 0) index = this.ulContentLi.length - 1;
		if(index>this.ulContentLi.length-1) index=0;
		var _this = this,
			selectedLi = _this.ulContentLi[index];
		W(_this.ulContentLi[_this.fouseNum]).insertSiblingBefore(selectedLi);
		_this.ulContent.css('marginLeft', '-' + this.cellwidth + 'px');
		_this.fouseNum=index;
		_this.ulContent.animate({
			marginLeft: {
				from: '-' + this.cellwidth + 'px',
				to: '0px'
			}
		}, 500);
		this.ulList.query('.on').removeClass('on');
		W(_this.navli[index]).addClass('on');
	}

	// Slide.prototype.premove = function(index) {
	// 	var _this = this;
	// 	if (index <0) {
	// 		index =  this.ulContentLi.length - 1;
	// 		this.ulContent.css('marginLeft', this.cellwidth + 'px');
	// 		_this.ulContent.animate({
	// 			marginLeft: {
	// 				from: this.cellwidth + 'px',
	// 				to: '0px'
	// 			}
	// 		}, 500);
	// 	} else {
	// 		_this.ulContent.animate({
	// 			marginLeft: {
	// 				from: '-' + this.cellwidth * (index - 1) + 'px',
	// 				to: '-' + this.cellwidth * index + 'px'
	// 			}
	// 		}, 500);
	// 	}
	// 	_this.fouseNum = index;

	// }

	Slide.prototype.premove = function(index) {
		var _this = this;
		if (index < 0) index = this.ulContentLi.length - 1;
		this.ulContent
		var _this = this,
			selectedLi = _this.ulContentLi[index];
		W(_this.ulContentLi[_this.fouseNum]).insertSiblingAfter(selectedLi);
		var marginLeft = this.ulContent.css('marginLeft');
			console.log(_this.fouseNum);
		// _this.ulContent.css('marginLeft', '-' + this.cellwidth + 'px');
		_this.fouseNum = index;
		_this.ulContent.animate({
			marginLeft: {
				from: '0px',
				to: '-' + this.cellwidth + 'px'
			}
		}, 500, function() {
			console.log(_this.fouseNum);
		});

		// this.ulList.query('.on').removeClass('on');
		// W(_this.navli[index]).addClass('on');

	}
	// 执行循环轮播
	Slide.prototype.doSlide=function(){
		var _this=this;
		this.t=setInterval(function(){
			_this.rightMove(_this.fouseNum+1);
		},_this.speed);
	};	
	//绑定方法
	Slide.prototype.bindEvent = function() {

		var _this = this;

		// 点击按钮向上翻

		_this.preBtn.on('click', function() {
			_this.premove(_this.fouseNum - 1);
		})


		// 点击按钮向下翻
		_this.nextBtn.on('click', function() {
			_this.rightMove(_this.fouseNum + 1);
		})


		// 鼠标移入停止动画
		_this.wraperBox.on('mouseenter', function() {
			clearInterval(_this.t);
		})

		// 鼠标移出开始动画

		// _this.wraperBox.on('mouseleave', function() {
		// 	_this.doSlide(_this.fouseNum + 1);

		// });

		//鼠标移入nav

		_this.navli.on('mouseenter', function() {
			var index = W(this).getAttr('data-index') - 1;
			_this.rightMove(index);
		})


	}
	// 执行函数
	Slide.prototype.init=function(){
		var _this=this;
		this.rightMove(_this.firstShow);
		if(this.autoplay){
			// this.doSlide();
		}
		this.bindEvent();
	};
	window.Slide = Slide;
}());