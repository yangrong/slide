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
		Function.extend(this, this.option(opt));
		this.t = null;

		//全局要用的参数
		this.cellwidth = wraperBox.getRect().width;
	}


	// 初始化设置
	Slide.prototype.option = function(options) {
		this.option = {
			//记录第一张聚焦的图片在哪里。
			fouseNum: 0,
			speed: 3000,
			autoplay: true,
			hasList: true
		};
		return Function.extend(this.option, options || {})
	};
	// 调用图片轮播函数
	Slide.prototype.move = function(index) {
		if (index < 0) index = this.ulContentLi.length - 1;
		if (index > this.ulContentLi.length - 1) index = 0;
		var _this = this,
			selectedLi = _this.ulContentLi[index];
		W(_this.ulContentLi[_this.option.fouseNum]).insertSiblingBefore(selectedLi);
		_this.ulContent.css('marginLeft', '-' + this.cellwidth + 'px');
		_this.option.fouseNum = index;
		_this.ulContent.animate({
			marginLeft: {
				from: '-' + this.cellwidth + 'px',
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
	Slide.prototype.doSlide = function() {
		var _this = this;
		console.log(_this.option.speed);
		this.t = setInterval(function() {
			_this.move(_this.option.fouseNum + 1);
			_this.listMove('right');
		}, _this.option.speed);
	};
	// 点击按钮向上翻
	Slide.prototype.preMove = function() {
		var _this = this;
		_this.preBtn.on('click', function() {
			_this.move(_this.option.fouseNum - 1);
			_this.listMove('left');

		})

	};
	// 点击按钮向下翻
	Slide.prototype.nextMove = function() {
		var _this = this;
		this.nextBtn.on('click', function() {
			_this.move(_this.option.fouseNum + 1);
			_this.listMove('right');

		})

	};

	// 找到对应类名的在父层的index索引值
	Slide.prototype.findLiIndex = function(obj, className) {
		for (var i = 0; i < obj.length; i++) {
			if (W(obj[i]).hasClass(className)) {
				return i;
			}
		}
	};
	// 鼠标移入停止动画
	Slide.prototype.mouseenter = function() {
		var _this = this;
		this.wraperBox.on('mouseenter', function() {
			clearInterval(_this.t);
		})
	};
	// 鼠标移出开始动画
	Slide.prototype.mouseout = function() {
		var _this = this;
		this.wraperBox.on('mouseleave', _this.doSlide);
	};
	// 动态生成菜单列表个数
	Slide.prototype.createList = function() {
		var liLength = this.wraperBox.query('ul li').length;
		for (var i = 0; i < liLength; i++) {
			var createLi = Dom.createElement('li');
			W(createLi).appendTo(this.ulList);
		};
		this.ulList.query('li:first-child').addClass('on');
	};
	// 鼠标移入菜单列表页
	Slide.prototype.listMouseenter = function() {
		var _this = this;
		_this.ulList.delegate('>li', 'mouseenter', function() {

			var allList = _this.ulList.query('li');
			// 	onIndex =_this.findLiIndex(allList, 'on');
			_this.ulList.query('.on').removeClass('on');
			W(this).addClass('now-mouseenter').addClass('on');
			//找到当前移入的li的index
			var nowIndex = _this.findLiIndex(allList, 'now-mouseenter');
			_this.move(nowIndex);
			W(this).removeClass('now-mouseenter');
		});
	}
	Slide.prototype.addDataNum = function() {
		for (var i = 0; i < this.ulContentLi.length; i++) {
			W(this.ulContentLi[i]).setAttr('data-num', i);
		};
	}
	// 执行函数
	Slide.prototype.init = function() {
		this.createList();
		if (this.option.autoplay) {
			this.doSlide();
		}
		this.mouseenter();
		this.mouseout();
		this.nextMove();
		this.preMove();
		this.listMouseenter();
		this.addDataNum();
		console.log(this.option.fouseNum)
	};
	window.Slide = Slide;
}());