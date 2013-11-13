define(function(require, exports, module) {
	var cookie = require("jqcookie");
	var storage = require("jqlocalstorage");
	jQuery.contextMenu = require("jqcontextmenu");
	var win = window,
		doc = win.document,
		ua = navigator.userAgent.toLowerCase(),
		isie = /(msie) ([\w.]+)/.exec(ua) && /(msie) ([\w.]+)/.exec(ua)[1] == "msie",
		p = navigator.platform.toLowerCase(),
		ispc = (p.match(/win|mac|x11|linux/i) != null && !/win|mac|x11|linux/.test(p.match(/win|mac|x11|linux/i)[0])) || !/cros/.test(/(cros) [a-z 0-9]+ ([\d.]+)/.exec(ua)),
		_toString = Object.prototype.toString,
		isFunction = function(v) {
			return (v != null) ? typeof v === "function" && typeof v.call != 'undefined' && _toString.call(v) === '[object Function]' : false;
		},
		ispc = ua.match(/android|mobile/i) ? false : ispc,
		videoplayer = function(options) {
			return new videoplayer.fn.init(options);
		};
	videoplayer.fn = videoplayer.prototype = {
		constructor: videoplayer,
		name: "HTML5VIDEO",
		ver: "0.1.1",
		init: function(ops) {
			var videobox = jQuery("#video"),
				canpt = ['video/mp4', 'video/ogg', 'video/webm'],
				canpt_end = [],
				options = {
					preload: "auto",
					poster: "",
					loop: false,
					defaultMuted: false,
					defaultPlaybackRate: 1,
					width: "100%",
					height: "100%",
					id: "video_html5_api",
					params: {
						quality: "high",
						allowScriptAccess: "always",
						wMode: "opaque",
						swLiveConnect: "true",
						allowFullScreen: "true",
						bgColor: "#000000",
						flashVars: "adss=0&amp;auto=1&amp;logo=#&amp;api=1"
					}
				},
				canHtml5 = (function() {
					return doc.createElement("video").canPlayType;
				})(),
				gettype = function(url) {
					var type = /\.(mp4|ogv|webm)/.exec(url) && /\.(mp4|ogv|webm)/.exec(url)[1];
					var types = {
						mp4: canpt[0],
						ogv: canpt[1],
						webm: canpt[2]
					};
					return types[type] || false;
				},
				getTime = function(a, c) {
					c = c || a;
					var d = Math.floor(a % 60),
						e = Math.floor(a / 60 % 60),
						g = Math.floor(a / 3600),
						h = Math.floor(c / 60 % 60),
						k = Math.floor(c / 3600);
					if (isNaN(a) || Infinity === a) g = e = d = "-";
					g = 0 < g || 0 < k ? g + ":" : "";
					return g + (((g || 10 <= h) && 10 > e ? "0" + e : e) + ":") + (10 > d ? "0" + d : d)
				},
				getXY = function(menu, e) {
					var mini = 50,
						miniY = video.fullscreened ? mini : jQuery(videobox).offset().top + mini,
						maxY = video.fullscreened ? jQuery(videobox).height() : jQuery(videobox).offset().top + jQuery(videobox).height(),
						miniX = video.fullscreened ? mini : jQuery(videobox).offset().left + mini,
						maxX = video.fullscreened ? jQuery(videobox).width() : jQuery(videobox).offset().left + jQuery(videobox).width();

					var top = e.clientY <= miniY ? 0 : (e.clientY + mini) >= maxY ? e.clientY - menu.height() : e.clientY - mini,
						left = e.clientX <= miniX ? 0 : (e.clientX + menu.width()) >= maxX ? e.clientX - jQuery(videobox).offset().left - menu.width() : e.clientX - jQuery(videobox).offset().left - mini;
					return {
						top: top,
						left: left
					};
				},
				videoCanPlay = (function() {
					if (ops.url) {
						if (typeof ops.url == "string") ops.url = ops.url.split(' ');
						var videoIsCanPlay = false;
						jQuery.each(ops.url, function(i, file) {
							videoIsCanPlay = gettype(file);
							ops.url = [file];
							if (videoIsCanPlay) return false;
						});
						return videoIsCanPlay;
					}
				})(),
				flashplayer = function(ops, callback) {
					jQuery.extend(options, ops);
					var v = options.url[0],
						html = ['<object width="' + options.width + '" height="' + options.height + '" id="' + options.id + '" ' + (isie ? 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie" value="' + v + '">' : 'data="' + v + '" type="application/x-shockwave-flash">') + ''];
					if (options.params) {
						jQuery.each(options.params, function(name, value) {
							html.push('<param value="' + value + '" name="' + name + '" />');
						});
					}
					html.push('</object>');
					jQuery("#" + options.id).remove();
					videobox.css({
						width: options.width,
						height: options.height
					}).html(html.join(''));
					if (isFunction(callback)) callback.call(jQuery("#" + options.id), options);
				};
			if (canHtml5 && videoCanPlay) {
				jQuery.extend(options, ops);

				var video = jQuery("#" + options.id),
					self = this,
					max = 0,
					connectNum = 0,
					connectNumMax = 3,
					playnum = 0,
					isCanplay = false,
					navtype = "",
					autoplay = true,
					infoTimeout = null,
					logoTimeout = null,
					info = [],
					dragging = false,
					videolen = 0,
					slideTimeout = null,
					swhiTimeout = null,
					status = "defalut",
					ispaused = false,
					mouseX, mouseY, objX, objY;

				videobox.css({
					"width": options.width,
					"height": options.height
				});
				if (video.length > 0) {
					videobox.append('<div class="loading" style="display:none"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div><div class="centerplay"></div><div id="video_control" class="video_control"><button type="button" name="play" class="playbutton"></button><input type="range" min="0" max="0" step="0" class="video_range" name="playtime" /><span id="video_len" class="video_len">0.00/0.00</span><div class="video_slider"><div class="video_slider_backA"><div class="video_buffer"></div><div class="video_slider_back"></div></div><div class="video_slider_button"></div></div><button type="button" name="muted" class="volumebutton"></button><input type="range" min="0" max="10" step="0" name="playvolume" class="playvolume" /><button type="button" name="fullscreen" class="fullscreen"></button></div><div id="video_logo" class="video_logo"><span>Power by</span> ' + this.name + '</div><div id="video_info" class="video_info"></div>');
					var playbutton = jQuery(".playbutton"),
						mutedbutton = jQuery(".volumebutton"),
						fullscreenbutton = jQuery(".fullscreen"),
						timelen = jQuery("#video_len"),
						videoSlider = jQuery(".video_slider"),
						playtime = jQuery("input[name=playtime]"),
						videoSliderButton = jQuery(".video_slider_button"),
						videoSliderpro = jQuery(".video_slider_back"),
						fullscreenButton = jQuery("button[name=fullscreen]"),
						videoBuffer = jQuery(".video_buffer"),
						volumeButton = jQuery("input[name=playvolume]"),
						videoInfo = jQuery("#video_info"),
						videoLogo = jQuery("#video_logo"),
						videoControl = jQuery(".video_control"),
						videoCenterplay = jQuery(".centerplay"),
						videoLoading = jQuery(".loading"),
						onloadstart = function() {
							ontimeinfo("连接视频");
						},
						ondurationchange = function() {
							videolen = this.duration;
							var max = getTime(this.duration);
							playtime.attr("max", this.duration);
							timelen.show().html("0:00/" + (max && max != "Infinity" ? max : "..."));
						},
						onloadedmetadata = function() {
							ontimeinfo("获取信息");
						},
						onloadeddata = function() {
							ontimeinfo("准备缓冲");
						},
						onprogress = function() {
							if (this.buffered.length > 0) {
								if (video.buffered.end(i) != video.duration) {
									ontimeinfo("缓冲中");
									videoLoading.show();
								} else {
									ontimeinfo("缓冲完成");
									videoLoading.hide();
								}
								var i = this.buffered.length - 1;
								var max = (this.duration.toFixed(1) / 60).toFixed(2);
								var left = (video.buffered.start(i).toFixed(1) / 60).toFixed(2) || 0,
									width = (video.buffered.end(i).toFixed(1) / 60).toFixed(2) || 0;
								width = ((width / max)) * videoSlider.width();
								if (width == videoSlider.width()) width = "100%";
								videoBuffer.attr("id", "bufferitem_" + i).css({
									"width": width
								});
							}
						},
						oncanplay = function() {
							if (status == "defalut") {
								var timeupdate = cookie.exec("timeupdate") || false;
								if (timeupdate && video.currentSrc == timeupdate.split(', ')[0]) {
									this.currentTime = timeupdate.split(', ')[1];
								}
							}
							isCanplay = true;
							videoLoading.hide();
							videoControl.animate({
								bottom: 0
							}, "slow");
						},
						oncanplaythrough = function() {
							if ((autoplay && status == "defalut") || (video.looped && (status == "ended" || this.currentTime == 0)) || status == "defalut") video.play();
						},
						onseeking = function() {

						},
						onseeked = function() {

						},
						ontimeupdate = function() {
							var max = getTime(this.duration);
							var time = getTime(this.currentTime, this.duration);
							jQuery.each(video.textlist, function(i, value) {
								if (parseFloat(time) >= value.start && parseFloat(time) <= value.end) {
									jQuery(video.textbox).html(value.text).show();
								} else if (value.end < parseFloat(time)) {
									jQuery(video.textbox).hide();
								}
							});
							cookie.exec("timeupdate", "" + video.currentSrc + ", " + this.currentTime + "");
							timelen.show().html(time + "/" + (max && max != "Infinity" ? max : "..."));
							var left = (this.currentTime / this.duration) * videoSlider.width();
							left = left <= 10 ? 0 : left - 10 >= videoSlider.width() ? left - 10 : left;
							playtime[0].value = this.currentTime;
							videoSliderButton.css({
								"left": left
							});
							videoSliderpro.css({
								"width": left + 10
							});
						},
						onpause = function() {
							if (status == "ended") {
								ontimeinfo("停止播放", "pause");
							} else {
								ontimeinfo("暂停播放", "pause");
							}
							videoCenterplay.show();
							playbutton.addClass("playbutton").removeClass('pausebutton');
							if (isCanplay) {
								clearTimeout(swhiTimeout);
								swhiTimeout = setTimeout(function() {
									videoControl.slideUp();
								}, 1500);
							}
						},
						onplaying = function() {
							ontimeinfo("开始播放", "play");
							videoCenterplay.hide();
							playbutton.addClass("pausebutton").removeClass('playbutton');
							if (isCanplay) {
								clearTimeout(swhiTimeout);
								swhiTimeout = setTimeout(function() {
									videoControl.slideDown();
								}, 500);
							}
						},
						onvolumechange = function() {
							var volume = this.volume * 10;
							if (this.muted || this.volume == 0) {
								ontimeinfo("静音");
								mutedbutton.addClass("mutedbutton").removeClass('volumebutton');
								volumeButton[0].value = 0;
							} else {
								ontimeinfo("正常");
								mutedbutton.addClass("volumebutton").removeClass('mutedbutton');
								volumeButton[0].value = volume;
							}
						},
						onended = function() {
							video.currentTime = 0;
							ontimeinfo("播放完成", "ended");
							if (status == "ended") {
								video.currentTime = 0;
							}
						},
						onstalled = function() {
							ontimeinfo("网速过慢，播放器将暂停缓冲后再播放");
							video.pause();
						},
						onabort = function() {
							connectNum += 1;
							if (connectNum < connectNumMax) {
								video.load();
							} else {
								video.pause();
								ontimeinfo("您的浏览器已经停止请求视频");
								videoLoading.hide();
							}
						},
						onsuspend = function() {
							ontimeinfo("缓冲时间过长，浏览器尝试重新连接视频");
						},
						onwaiting = function() {
							video.pause();
						},
						onrangchange = function() {
							video.currentTime = this.value;
							if (!dragging) {
								ontimeinfo("调整播放进度");
								video.play();
							}
						},
						onrangvolume = function() {
							video.volume = this.value / 10;
						},
						onmuted_click = function() {
							if (video.muted) {
								video.volume = 1;
								volumeButton[0].value = 10;
								video.muted = false;
							} else {
								video.volume = 0;
								volumeButton[0].value = 0;
								video.muted = true;
							}
						},
						onplay_click = function() {
							if (video.paused || video.ended) {
								video.play();
								ontimeinfo("开始播放");
							} else {
								video.pause();
								ontimeinfo("暂停播放");
							}
						},
						onerror = function() {
							if (video.error) {
								switch (video.error.code) {
									case 1:
										ontimeinfo("错误：你停止视频.");
										break;
									case 2:
										ontimeinfo("错误：网络错误-请稍后再试.");
										break;
									case 3:
										ontimeinfo("错误：视频连接断了，请稍候重试。");
										videoLoading.hide();
										videoCenterplay.show();
										video.abort();
										break;
									case 4:
										ontimeinfo("错误：对不起，您的浏览器无法播放此视频.");
										flashplayer(options, isFunction(options.flashCallback) ? options.flashCallback : function() {});
										break;
								}
								status = "ended";
								video.pause();
								videoLoading.hide();
							}
						},
						onplaychange = function() {
							onplay_click.call(playbutton[0]);
						},
						onrangclick = function() {
							video.pause();
							video.currentTime = playtime[0].value;
							video.play();
						},
						onvideo_mousedown = function(e) {
							var evt = e.target;
							e.preventDefault();
							if (jQuery(evt).parents("#video")) {
								switch (e.button) {
									case 0:
										break;
									case 1:
										break;
									case 2:
										var contextMenuConfig = [{
											type: "text",
											title: "版本 " + self.ver
										}, {
											type: "line"
										}, {
											type: "button",
											title: video.paused ? "播放视频" : "暂停播放",
											callback: function(video, el, evt) {
												if (video.paused) {
													video.play();
													el.html("暂停播放");
												} else {
													video.pause();
													el.html("播放视频");
												}
											}
										}, {
											type: "button",
											title: video.looped ? "停止循环" : "循环播放",
											callback: function(video, el, evt) {
												if (video.looped) {
													video.loop = false;
													el.html("循环播放");
													video.looped = false;
												} else {
													video.loop = true;
													el.html("停止循环");
													video.looped = true;
												}
											}
										}, {
											type: "button",
											title: video.fullscreened ? "取消全屏" : "开启全屏",
											callback: function(video, el, evt) {
												if (video.fullscreened) {
													onfullscreen_click_msie();
													el.html("开启全屏");
												} else {
													onfullscreen_click_msie();
													el.html("取消全屏");
												}
											}
										}, {
											type: "line"
										}];

										if (video.languaged) {
											contextMenuConfig.push({
												type: "menu",
												title: "字幕",
												menu: (function(lang, tracks) {
													var menus = [];
													jQuery.each(tracks, function(name, value) {
														var textlang = name == "cn" ? "中文/cn" : name == "en" ? "英文/en" : undefined;
														if (typeof textlang != "undefined") {
															menus.push({
																type: "checkbox",
																title: textlang,
																value: name,
																activeItem: (lang == name),
																callback: function(video, el, evt) {
																	avticeTracks(jQuery(el).attr("data-value"));
																}
															});
														}
													});
													return menus;
												})(video.languaged, options.textTracks)
											});
											contextMenuConfig.push({
												type: "line"
											});
										}

										jQuery.each([{
											type: "menu",
											title: "声音",
											menu: [{
												type: "button",
												title: video.muted ? "正常" : "静音",
												callback: function(video, el, evt) {
													if (video.muted) {
														video.volume = 1;
														video.muted = false;
														el.html("静音");
													} else {
														video.volume = 0;
														video.muted = true;
														el.html("正常");
													}
												}
											}, {
												type: "line"
											}, {
												type: "checkbox",
												title: "最大声音",
												value: 1,
												activeItem: (video.volume == 1),
												callback: function(video, el, evt) {
													video.volume = jQuery(el).attr("data-value");
												}
											}, {
												type: "checkbox",
												title: "中等声音",
												value: 0.6,
												activeItem: (video.volume == 0.6),
												callback: function(video, el, evt) {
													video.volume = jQuery(el).attr("data-value");
												}
											}, {
												type: "checkbox",
												title: "最小声音",
												value: 0.2,
												activeItem: (video.volume == 0.2),
												callback: function(video, el, evt) {
													video.volume = jQuery(el).attr("data-value");
												}
											}]
										}, {
											type: "line"
										}, {
											type: "menu",
											title: "访问网站",
											menu: [{
												type: "button",
												title: "jlpm框架",
												callback: function() {
													win.open("https://github.com/ereddate/jlpm");
												}
											}, {
												type: "button",
												title: "easyjs模块管理",
												callback: function() {
													win.open("https://github.com/ereddate/easyjs");
												}
											}, {
												type: "button",
												title: "html5video播放器",
												callback: function() {
													win.open("https://github.com/ereddate/html5video");
												}
											}, {
												type: "line"
											}, {
												type: "button",
												title: "开发者(ereddate)微博",
												callback: function() {
													win.open("http://weibo.com/iliulancom");
												}
											}]
										}], function() {
											contextMenuConfig.push(this);
										});
										video.oncontextmenu = function(e) {
											e.preventDefault();
											if (isCanplay) {
												var menu = jQuery.contextMenu.exec(jQuery("#video_html5_api"), contextMenuConfig),
													top = getXY(menu, e).top,
													left = getXY(menu, e).left;
												menu.css({
													top: top,
													left: left
												}).show();
											}
										};
										break;
								}
							}
						},
						onfullscreen_nopc_click = function() {
							if (!video.fullscreened) {
								videobox.addClass('msiefullscreen').css({
									"width": "100%",
									"height": "100%"
								});
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
							}
							video.width = videobox.width();
						},
						onfullscreen_click = function() {
							var videoboxA = videobox[0];
							if (!video.fullscreened) {
								if (video.webkitRequestFullScreen) {
									video.webkitRequestFullScreen();
									navtype = "webkit";
								} else if (videoboxA.mozRequestFullScreen) {
									videoboxA.mozRequestFullScreen();
									navtype = "moz";
								} else if (videoboxA.requestFullscreen) {
									videoboxA.requestFullscreen();
									navtype = "";
								}
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('nofullscreen').removeClass('fullscreen');
								ontimeinfo("进入全屏(按ESC键退出全屏)");
							} else {
								if (doc.webkitCancelFullScreen) {
									doc.webkitCancelFullScreen();
								} else if (doc.mozCancelFullScreen) {
									doc.mozCancelFullScreen();
								} else if (doc.exitFullscreen) {
									doc.exitFullscreen();
								}
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
							video.width = videobox.width();
						},
						onfullscreen_click_msie = function() {
							if (!video.fullscreened) {
								videobox.addClass('msiefullscreen').css({
									"width": "100%",
									"height": "100%"
								});
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('nofullscreen').removeClass('fullscreen');
								ontimeinfo("进入全屏(按ESC键退出全屏)");
							} else {
								videobox.removeClass('msiefullscreen').css({
									"width": options.width,
									"height": options.height
								});
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
							video.width = videobox.width();
						},
						onfullscreenkeyup_msie = function(e) {
							if (e.keyCode == 27 && video.fullscreened) {
								videobox.removeClass('msiefullscreen').css({
									"width": options.width,
									"height": options.height
								});
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								video.width = videobox.width();
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
						},
						onfullscreenchange = function() {
							if (doc.fullscreen || doc.webkitIsFullScreen || doc.mozFullScreen || doc.fullscreenElement || false) {} else {
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								video.width = videobox.width();
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
						},
						onvideosliderbutton_mousedown = function(e) {
							dragging = true;
							video.pause();
							mouseX = parseInt(e.clientX);
							objX = parseInt(jQuery(this).css("left"));
						},
						onvideosliderbutton_mousemove = function(e) {
							if (dragging == true) {
								var x = e.clientX - mouseX + objX;
								jQuery(this).css({
									"left": x + "px"
								});
								videoSliderpro.css({
									"width": x + "px"
								});
								var value = x / videoSlider.width() * video.duration;
								playtime[0].value = value;
							}
						},
						onvideosliderbutton_mouseup = function(e) {
							dragging = false;
							video.currentTime = playtime[0].value;
							clearTimeout(slideTimeout);
							slideTimeout = setTimeout(function() {
								video.play();
							}, 500);
						},
						onvideoslider_mousedown = function(e) {
							video.pause();
							var mouseX = parseInt(e.clientX);
							objX = parseFloat(videoSliderButton.css("left"));
							var x = mouseX - parseFloat(videoSlider.offset().left);
							videoSliderButton.stop().animate({
								"left": x + "px"
							}, "fast");
							videoSliderpro.stop().animate({
								"width": (x + 10) + "px"
							}, "fast");
							var value = x / videoSlider.width() * video.duration;
							playtime[0].value = value;
							video.currentTime = value;
						},
						onvideoslider_mouseup = function(e) {
							clearTimeout(slideTimeout);
							slideTimeout = setTimeout(function() {
								video.play();
							}, 500);
						},
						ontimeinfo = function(info, type) {
							status = type || status;
							videoInfo.animate({
								opacity: 1
							}, "slow", function() {
								videoInfo.html(info);
							});
							clearTimeout(infoTimeout);
							infoTimeout = setTimeout(function() {
								videoInfo.animate({
									opacity: 0
								}, "slow", function() {
									videoInfo.html("");
								});
							}, 5000);
						},
						ontimelogo = function(info) {
							videoLogo.slideDown().html("<span>Power by</span> " + this.name + info);
						};
					try {
						ontimelogo.call(this, options.logo && "/" + options.logo || "");
						if (video[0].canPlayType) {
							if (options.url) {
								if (typeof options.url == "string") options.url = options.url.split(' ');
								jQuery.each(options.url, function(i, file) {
									var type = gettype(file);
									if (type) {
										video.append(jQuery("<source></source>").attr({
											"src": file,
											"type": type
										}));
									}
								});
								delete options.url;
							}
							if (options.autoplay) {
								autoplay = options.autoplay;
								delete options.autoplay;
							}
							var attrs = {};
							jQuery.each(options, function(name, value) {
								if (!/textTracks|flashplayer|defaultMuted|defaultPlaybackRate|params/.test(name)) attrs[name] = value;
							});
							video.attr(attrs);
							video.on("error", onerror).on("canplay", oncanplay).on("loadedmetadata", onloadedmetadata).on("timeupdate", ontimeupdate).on("playing", onplaying).on("pause", onpause).on("volumechange", onvolumechange).on("loadstart", onloadstart).on("ended", onended).on("stalled", onstalled).on("waiting", onwaiting).on("progress", onprogress).on("loadeddata", onloadeddata).on("durationchange", ondurationchange).on("suspend", onsuspend).on("seeking", onseeking).on("seeked", onseeked).on("canplaythrough", oncanplaythrough).on("abort", onabort).on("click", onplaychange);

							videobox.on("mousedown", onvideo_mousedown);
							jQuery(doc).on("mousedown", onvideo_mousedown);
							videobox.hover(function() {
								if (isCanplay) {
									clearTimeout(swhiTimeout);
									swhiTimeout = setTimeout(function() {
										videoControl.slideDown();
									}, 500);
								}
							}, function() {
								if (isCanplay) {
									clearTimeout(swhiTimeout);
									swhiTimeout = setTimeout(function() {
										videoControl.slideUp();
									}, 1500);
								}
							});
							videoCenterplay.on("click", onplaychange);
							fullscreenButton.on("click", onfullscreen_click_msie);
							jQuery(doc).on("keyup", onfullscreenkeyup_msie);
							playtime.on("click", onrangclick).on("change", onrangchange);
							volumeButton.on("change", onrangvolume);
							mutedbutton.on("click", onmuted_click);
							playbutton.on("click", onplay_click);
							videoSliderButton.on("mousedown", onvideosliderbutton_mousedown).on("mouseup", onvideosliderbutton_mouseup).on("mousemove", onvideosliderbutton_mousemove);
							videoSlider.on("mousedown", onvideoslider_mousedown).on("mouseup", onvideoslider_mouseup);
							jQuery(".videohome").css("height", video.parent().height());
							video = video[0];
							var TextTrackCue = function(context, start, end) {
								return {
									text: context,
									start: start,
									end: end
								};
							},
								avticeTracks = function(lang) {
									video.textlist = [];
									video.languaged = lang;
									var texttrack = video.addTextTrack("caption");
									jQuery.each(options.textTracks, function(name, value) {
										if (name == video.languaged) {
											jQuery.each(value, function(i, svalue) {
												texttrack.addCue(new TextTrackCue(svalue.context, svalue.start, svalue.end, "", "", "", true));
											});
										}
									});
								};

							video.addTextTrack = function(type) {
								var texttrack;
								texttrack = jQuery(".caption").length > 0 ? jQuery(".caption") : jQuery("<div></div>").addClass("caption");
								video.textbox = texttrack;
								jQuery(videobox).append(texttrack);
								return video.addTextTrack;
							};
							video.textlist = [];
							video.addTextTrack.addCue = function(obj) {
								video.textlist.push(obj);
							};
							video.width = videobox.width();
							video.height = videobox.height();
							video.defaultMuted = options.defaultMuted;
							video.volume = 1;
							video.fullscreened = false;
							video.looped = options.loop;
							video.autobuffer = true;
							if (options.textLanguage) avticeTracks(options.textLanguage);
						} else {
							ontimeinfo("你的浏览器不支持此格式视频");
						}
					} catch (e) {
						alert(e);
					}
				}
			} else {
				flashplayer(ops, isFunction(ops.flashCallback) ? ops.flashCallback : function() {});
			}
		}
	};
	videoplayer.fn.init.prototype = videoplayer.fn;
	exports.exec = videoplayer;
});