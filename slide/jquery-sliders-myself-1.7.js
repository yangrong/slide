/******
从qwrap 移至jquery，修改1.1.1大家建议的修改点，完成向左移，向右移的两边的动画，用插入当前画面的前面或者后面，解决1.3版本出现的从1——5快速滑动，太快，有点晕

此版本修改点
1. 修改代码细节
2. 添加lazyload
3. 判断是否在可视区域,再执行动画.
*****/

(function() {
	function Slide(wraperBox, next, pre, ulcontent, ulNavlist, wraper, opt) {
		//最外层的div
		this.wraper = wraper;
		//把ul隐藏起来的div
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
		$.extend(this, this.option(opt));
		this.t = null;
		//显示区域宽度
		this.cellwidth = wraperBox.width();

		//刚刚开始的时间
		this.startTime=null;
		//动画被调用的时间
		this.newStartTime=null;
		//一个动画运行时间内触发动画的

		//slide元素在浏览器的位置
		this.slideSize = {
			left: wraper.offset().left,
			top: wraper.offset().top,
			width: wraper.width(),
			height: wraper.height()
		};
	}
	Slide.prototype.option = function(options) {
		this.option = {
			//记录第一张聚焦的图片在哪里。
			fouseNum: 0,
			speed: 3000,
			autoplay: true,
			hasList: true,
			lazyloadType: 'img'
		};
		return $.extend(this.option, options || {})
	};
	Slide.prototype.firstShow = function(index) {
		if (this.lazyloadType == 'img') {
			this.imgLazyload(this.fouseNum);
		}
		this.ulContent.css('margin-left', '-' + index * this.cellwidth + 'px');
		this.changeClass(this.fouseNum, 'on');
	}

	//向右运动
	Slide.prototype.rightMove = function(index) {
		console.log(index,this.fouseNum);
		if (index > this.Lilength - 1) index = 0;
		if (this.ulContentLi[this.fouseNum].offsetLeft < this.ulContentLi[index].offsetLeft) {
			console.log('margincurrent:',this.ulContent.css('margin-left'));
			var changeLeft = parseInt(this.ulContent.css('margin-left')) - parseInt(this.cellwidth);
			this.ulContent.css('margin-left', changeLeft + 'px');
		}
		$(this.ulContentLi[index]).insertBefore(this.ulContentLi[this.fouseNum]);
		var distance = (-parseInt(this.ulContent.css('margin-left')))%this.cellwidth
		console.log(distance);
		console.log('margin:',distance,index);
		this.moveSlide('right',distance);
		this.changeClass(index, 'on');
	}

	//向左运动
	Slide.prototype.leftMove = function(index) {
		if (index < 0) index = this.Lilength - 1;
		console.log('margincurrent:',this.ulContent.css('margin-left'));
		if (this.ulContentLi[this.fouseNum].offsetLeft > this.ulContentLi[index].offsetLeft) {
			var changeLeft = parseInt(this.ulContent.css('margin-left')) + parseInt(this.cellwidth);
			this.ulContent.css('margin-left', changeLeft + 'px');
		}
		$(this.ulContentLi[index]).insertAfter(this.ulContentLi[this.fouseNum]);
		this.fouseNum = index;
		this.moveSlide('left',index);
		this.changeClass(this.fouseNum, 'on');
	}
	// Slide.prototype.quickMove = function(){
	// 	return  this.newStartTime - this.startTime
	// }
	Slide.prototype.moveSlide = function(direction,distance,index) {
		if (this.lazyloadType == 'img') {
			this.imgLazyload(index);
		}
		//没有偏差的时候
		if(distance==0) distance=1000;

		//用前后时间差来算比列，得到差值距离会不准确。
		// var timeDifference = this.quickMove(),
		// 	realMoveWidth;
		// if (timeDifference > 0 && timeDifference < 1500) {
		// 	var addMoveWidth = this.cellwidth * (1500-timeDifference)/1500;
		// }
		// if(addMoveWidth)
		// {
		// 	realMoveWidth = this.cellwidth + addMoveWidth;
		// 	console.log(realMoveWidth);
		// }else{
		// 	realMoveWidth = this.cellwidth;
		// 	console.log(realMoveWidth);

		// }
		// this.startTime = new Date();

		if (direction === 'left') {
			this.ulContent.animate({
				'margin-left': '-=' + realMoveWidth + 'px'
			},1500);
		}
		if (direction === 'right') {
			this.ulContent.animate({
				'margin-left': '+=' +  distance + 'px'
			},1500,function(){
				this.fouseNum = index;
			});
		}
	}
	//后面显示的图片延迟加载
	Slide.prototype.imgLazyload = function(index) {
		var curSrcImg = $(this.ulContentLi[index]).find('img');
		for (var i = 0; i < curSrcImg.length; i++) {
			var imgDatasrc = $(curSrcImg[i]).attr("data-src");
			if (imgDatasrc) {
				$(curSrcImg[i]).attr('src', imgDatasrc);
			}
		};
	}
	Slide.prototype.changeClass = function(next, classname) {
		this.ulList.find('.' + classname).removeClass(classname);
		$(this.navli[next]).addClass(classname);
	}
	//自动轮播
	Slide.prototype.doSlide = function() {
		var _this = this;
		this.t = setInterval(function() {
			var windowSize = {
				left: $(window).scrollLeft(),
				top: $(window).scrollTop(),
				width: $(window).width(),
				height: $(window).height()
			};
			if (_this.isOverlapped(windowSize, _this.slideSize)) {
				_this.rightMove(_this.fouseNum + 1);
			}
		}, _this.speed);
	};
	//计算当前的slide与视图窗口是否有交集
	Slide.prototype.isOverlapped = function(idOne, idTwo) {
		var leftTop = idTwo.left > idOne.left && idTwo.left < idOne.left + idOne.width && idTwo.top > idOne.top && idTwo.top < idOne.top + idOne.height,
			rightTop = idTwo.left + idTwo.width > idOne.left && idTwo.left + idTwo.width < idOne.left + idOne.width && idTwo.top > idOne.top && idTwo.top < idOne.top + idOne.height,
			leftBottom = idTwo.left > idOne.left && idTwo.left < idOne.left + idOne.width && idTwo.top + idTwo.height > idOne.top && idTwo.top + idTwo.height < idOne.top + idOne.height,
			rightBottom = idTwo.left + idTwo.width > idOne.left && idTwo.left + idTwo.width < idOne.left + idOne.width && idTwo.top + idTwo.height > idOne.top && idTwo.top + idTwo.height < idOne.top + idOne.height;
		return leftTop || rightTop || leftBottom || rightBottom;
	}
	//绑定方法,把所有的方法绑定在一起方便管理。
	Slide.prototype.bindEvent = function() {
		var _this = this;
		// 点击按钮向上翻
		_this.preBtn.on('click', function() {
			_this.ulContent.stop(false ,  false);
			_this.newStartTime=new Date();
			_this.leftMove(_this.fouseNum - 1);
		})
		// 点击按钮向下翻
		_this.nextBtn.on('click', function() {
			_this.ulContent.stop(false , false);
			_this.newStartTime=new Date();
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
			// _this.doSlide();
			_this.preBtn.hide();
			_this.nextBtn.hide();
		});
		//鼠标移入nav的li
		_this.navli.on('mouseenter', function() {

			_this.ulContent.stop(false , false);
			_this.newStartTime=new Date();

			var curli = _this.ulList.find('.on')
			var preindex = _this.navli.index(curli);
			var curindex = _this.navli.index($(this));
			if (preindex < curindex) {
				_this.rightMove(parseInt(curindex));
			} else if (preindex > curindex) {
				_this.leftMove(parseInt(curindex));
			}
		})
		$(document).on('scroll', function() {
			if (this.autoplay) {
				this.doSlide();
			}
		})
	}
	// 执行函数
	Slide.prototype.init = function() {
		this.firstShow(this.fouseNum);

		if (this.autoplay) {
			// this.doSlide();
		}
		this.bindEvent();
	};
	window.Slide = Slide;
})();