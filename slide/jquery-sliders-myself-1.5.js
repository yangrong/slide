/******

从qwrap 移至jquery，修改1.1.1大家建议的修改点，完成向左移，向右移的两边的动画，用插入当前画面的前面或者后面，解决1.3版本出现的从1——5快速滑动，太快，有点晕。

此版本修复上一个版本遗留下的bug。
1. nav列表菜单在快速移动的时候，不能准确定位(已经修复)
2. 鼠标移入一出的时候，setInterval和clearInterval显示混乱(已经修复)
3. 3>1>2>3 ul整体移出1000px，（已修复）
4. 修复向左移动，下一个移入的元素，原来的位置在当前元素的前面，插入当前元素的后面。（已修复）

新功能：
1. 添加首次选中功能。
2. 上翻，下翻按钮移入显示。

*****/

(function() {
	function Slide(wraperBox, next, pre, ulcontent, ulNavlist, wraper, opt) {
		this.wraper = wraper;
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
			hasList: true
		};
		return $.extend(this.option, options || {})
	};
	//向右运动
	Slide.prototype.firstShow = function(index) {
		this.ulContent.css('margin-left', '-' + index * this.cellwidth + 'px');
		this.changeClass(this.fouseNum, 'on');

	}
	Slide.prototype.rightMove = function(index) {

		if (index > this.ulContentLi.length - 1) index = 0;
		console.log('fouseNum:', this.fouseNum, 'index:', index);
		
			// _this.switch_slide = false;
			var nowUl = this.ulContent.find('li');
			var fouseNumleft = nowUl.index(this.ulContentLi[this.fouseNum]);
			// console.log('fouseNumindex', fouseNumleft);
			var nextNumleft = nowUl.index(this.ulContentLi[index]);
			// console.log('nextNumindex', nextNumleft);


			$(this.ulContentLi[index]).insertBefore(this.ulContentLi[this.fouseNum]);
			if (fouseNumleft < nextNumleft) {
				var changeLeft = parseInt(this.ulContent.css('margin-left')) - parseInt(this.cellwidth);
				this.ulContent.css('margin-left', changeLeft + 'px');
			}
			this.fouseNum = index;
			this.ulContent.animate({
				'margin-left': '+=' + this.cellwidth + 'px'
			});
			this.changeClass(this.fouseNum, 'on');
		
	}
	//向左运动
	Slide.prototype.leftMove = function(index) {
		var _this = this;
		if (index < 0) index = this.ulContentLi.length - 1;
		// console.log('fouseNum:', _this.fouseNum, 'index:', index);

		
			// _this.switch_slide = false;
			var nowUl = this.ulContent.find('li');
			var fouseNumleft = nowUl.index(this.ulContentLi[_this.fouseNum]);
			// console.log('fouseNumindex', fouseNumleft);
			var nextNumleft = nowUl.index(this.ulContentLi[index]);
			// console.log('nextNumindex', nextNumleft);
			$(this.ulContentLi[index]).insertAfter(this.ulContentLi[_this.fouseNum]);
			if (fouseNumleft > nextNumleft) {
				var changeLeft = parseInt(this.ulContent.css('margin-left')) + parseInt(_this.cellwidth);
				this.ulContent.css('margin-left', changeLeft + 'px');
			}

			this.fouseNum = index;
			this.ulContent.animate({
				'margin-left': '-=' + _this.cellwidth + 'px'
			});
			_this.changeClass(_this.fouseNum, 'on');

		
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
			_this.ulContent.stop(true,true);
			_this.leftMove(_this.fouseNum - 1);
		})
		// 点击按钮向下翻
		_this.nextBtn.on('click', function() {
			_this.ulContent.stop(true,true);
			
			_this.rightMove(_this.fouseNum + 1);
		})


		_this.wraper.on('mouseenter', function() {
		// 鼠标移入停止动画
			clearInterval(_this.t);
			_this.preBtn.show();
			_this.nextBtn.show();

		})


		_this.wraper.on('mouseleave', function() {
		// 鼠标移出开始动画
			_this.doSlide();
			_this.preBtn.hide();
			_this.nextBtn.hide();
		});

		//鼠标移入nav的li

		_this.navli.on('mouseenter', function() {
			_this.ulContent.stop(true,true);
			var curli = _this.ulList.find('.on')
			var preindex = _this.navli.index(curli);
			// console.log(preindex);
			var curindex = _this.navli.index($(this));
			// console.log(curindex);
			if (preindex < curindex) {
				_this.rightMove(parseInt(curindex));
			} else if (preindex > curindex) {
				_this.leftMove(parseInt(curindex));
			}
		})

		// 移出nav
		// _this.ulList.on('mouseenter', function() {
		// 	_this.doSlide();
		// })


	}
	// 执行函数
	Slide.prototype.init = function() {

		var _this = this;
		_this.firstShow(_this.fouseNum);
		if (_this.autoplay) {
			_this.doSlide();
		}
		_this.bindEvent();
	};
	window.Slide = Slide;
})();