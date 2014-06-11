//从qwrap 移至jquery，修改1.1.1大家建议的修改点，完成向左移，向右移的两边的动画。
(function() {
	function Slide(wraperBox, next, pre, ulcontent, ulNavlist, opt) {
		this.wraperBox = wraperBox;
		this.nextBtn = next;
		this.preBtn = pre;
		// 存放图片的ul
		this.ulContent = ulcontent;
		// 存放图片的ul的li
		this.ulContentLi = ulcontent.find('li');
		this.Lilength = this.ulContentLi.length;

		// 存放菜单页的ul
		this.ulList = ulNavlist;
		this.navli = this.ulList.find('li');
		var a = $.extend(this, this.option(opt));
		// console.log(this);
		this.t = null;
		//动画开启开关。
		this.switch_slide = true;
		//显示区域宽度
		this.cellwidth = wraperBox.width();
	}
	Slide.prototype.option = function(options) {
		this.option = {
			//记录第一张聚焦的图片在哪里。
			fouseNum: 0,
			speed: 3000,
			autoplay: true,
			hasList: true,
		};
		return $.extend(this.option, options || {})
	};
	//向右运动
	Slide.prototype.rightMove = function(index) {
		var _this = this;
		if (index < 0) index = this.ulContentLi.length - 1;
		if (index > this.ulContentLi.length - 1) index = 0;
		if (_this.switch_slide) {

			_this.switch_slide = false;
			var nowUl = this.ulContent.find('li');
			var fouseNumleft = nowUl.index(this.ulContentLi[_this.fouseNum]);
			// console.log('fouseNumindex', fouseNumleft);
			var nextNumleft = nowUl.index(this.ulContentLi[index]);
			// console.log('nextNumindex', nextNumleft);

			$(this.ulContentLi[index]).insertBefore(this.ulContentLi[_this.fouseNum]);
			if (fouseNumleft < nextNumleft) {
				this.ulContent.css('margin-left', '-' + _this.cellwidth + 'px');
			}

			_this.fouseNum = index;
			this.ulContent.animate({
				'margin-left': '+=' + _this.cellwidth + 'px'
			}, function() {
				_this.switch_slide = true;
			});
			_this.changeClass(_this.fouseNum, 'on');
		}

	}
	//向左运动
	Slide.prototype.leftMove = function(index) {
		var _this = this;
		if (index < 0) index = this.Lilength - 1;
		if (this.switch_slide) {
			_this.switch_slide = false;
			$(this.ulContentLi[index]).insertAfter(this.ulContentLi[_this.fouseNum]);
			var curMarginLeft = this.ulContent.css('margin-left');
			if (parseInt(curMarginLeft) == -parseInt(this.cellwidth) * (this.Lilength - 1)) {
				this.ulContent.css('margin-left', '-' + parseInt(this.cellwidth) * (this.Lilength - 2) + 'px');
			}

			this.fouseNum = index;
			this.ulContent.animate({
				'margin-left': '-=' + _this.cellwidth + 'px'
			}, function() {
				_this.switch_slide = true;
			});
			_this.changeClass(_this.fouseNum, 'on');

		}
	}
	Slide.prototype.changeClass = function(next, classname) {
		this.ulList.find('.' + classname).removeClass(classname);
		$(this.navli[next]).addClass(classname);
	}
	//自动轮播
	Slide.prototype.doSlide = function() {
		var _this = this;
		this.t = setInterval(function() {
			// console.log(_this.fouseNum);
			_this.rightMove(_this.fouseNum + 1);
		}, _this.speed);
	};

	//绑定方法,把所有的方法绑定在一起方便管理。
	Slide.prototype.bindEvent = function() {
		var _this = this;
		// 点击按钮向上翻
		_this.preBtn.on('click', function() {
			clearInterval(_this.t);
			_this.leftMove(_this.fouseNum - 1);
		})
		// 点击按钮向下翻
		_this.nextBtn.on('click', function() {
			clearInterval(_this.t);
			_this.rightMove(_this.fouseNum + 1);
		})


		// 鼠标移入停止动画
		_this.wraperBox.on('mouseenter', function() {
			clearInterval(_this.t);
		})

		// 鼠标移出开始动画

		_this.wraperBox.on('mouseleave', function() {
			_this.doSlide();
		});

		//鼠标移入nav的li

		_this.navli.on('mouseenter', function() {
			clearInterval(_this.t);
			var curli = _this.ulList.find('.on')
			var preindex = _this.navli.index(curli);
			// console.log(preindex);
			var curindex = _this.navli.index($(this));
			// console.log(curindex);
			if (preindex < curindex) {
				_this.rightMove(parseInt(curindex));
			} else if (preindex > curindex) {
				_this.leftMove(parseInt(curindex));
			} else {
				return;
			}
		})

		// 移出nav
		_this.ulList.on('mouseenter', function() {
			_this.doSlide();
		})


	}
	// 执行函数
	Slide.prototype.init = function() {

		var _this = this;

		if (_this.autoplay) {
			_this.doSlide();
		}
		_this.bindEvent();
	};
	window.Slide = Slide;
})();