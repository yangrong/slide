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
			fouseNum: 1,
			speed: 3000,
			autoplay: true,
			hasList: true,
		};
		return $.extend(this.option, options || {})
	};
	//向右运动
	Slide.prototype.rightMove = function(index) {
		var _this = this;
		// console.log('index:', index);

		if (_this.switch_slide) {
			_this.switch_slide = false;
			_this.fouseNum = index;
			_this.ulContent.animate({
				'margin-left': '-' + index * _this.cellwidth + 'px'
			}, function() {
				if (index > _this.Lilength) {
					_this.fouseNum = 1;
					_this.ulContent.css('margin-left', '-' + _this.cellwidth + 'px');
				}
				_this.switch_slide = true;
				_this.ulList.find('.on').removeClass('on');
				$(_this.navli[_this.fouseNum - 1]).addClass('on');
			});

		}
	}
	//向左运动
	Slide.prototype.leftMove = function(index) {
		var _this = this;
		if (this.switch_slide) {
			this.switch_slide = false;
			this.fouseNum = index;
			_this.ulContent.animate({
				'margin-left': '-' + _this.fouseNum * _this.cellwidth + 'px'
			}, function() {
				if (_this.fouseNum == 0) {
					_this.fouseNum = _this.Lilength;
					_this.ulContent.css('margin-left', '-' + _this.cellwidth * _this.Lilength + 'px')
				}
				_this.switch_slide = true;
				_this.ulList.find('.on').removeClass('on');
				$(_this.navli[_this.fouseNum - 1]).addClass('on');
			});

		}
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
			_this.doSlide(_this.fouseNum + 1);
		});

		//鼠标移入nav

		_this.navli.on('mouseenter', function() {
			clearInterval(_this.t);
			var index = $(this).attr('data-index');
			_this.rightMove(parseInt(index));
		})


	}
	// 执行函数
	Slide.prototype.init = function() {

		var _this = this,
			first = _this.ulContentLi.first().clone(),
			last = _this.ulContentLi.last().clone();

		_this.ulContent.append(first).css('margin-left', '-' + _this.cellwidth + 'px');
		last.insertBefore(_this.ulContentLi.eq(0));
		if (_this.autoplay) {
			_this.doSlide();
		}
		_this.bindEvent();
	};
	window.Slide = Slide;
})();