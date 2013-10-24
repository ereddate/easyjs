(function(global) {
	if (global.CollectGarbage) CollectGarbage();
	var doc = global.document,
		_toString = Object.prototype.toString,
		docElem = doc.documentElement,
		hasOwn = Object.prototype.hasOwnProperty,
		indexOf = Array.prototype.indexOf,
		activeScript,
		currentlyAddingScript,
		interactiveScript,
		isArray = function(v) {
			return (v !== null) ? (v.constructor == Array) ? true : false : false;
		},
		isArraylike = function(obj) {
			var length = obj.length,
				type = typeof obj;
			if (typeof obj === "object" && "setInterval" in obj) {
				return false;
			}
			if (obj.nodeType === 1 && length) {
				return true;
			}
			return type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);
		},
		isParentObject = function(v) {
			var obj = v ? v : null;
			if (!obj || typeof obj !== "object" || obj.nodeType || typeof obj === "object" && "setInterval" in obj) {
				return false;
			}
			try {
				if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				return false;
			}
			var key;
			for (key in obj) {}
			return key === undefined || hasOwn.call(obj, key);
		},
		isEmptyObject = function(obj) {
			obj = obj ? obj : this[0];
			for (var name in obj) {
				return false;
			}
			return true;
		},
		inArray = function(obj, array) {
			array = array ? array : this[0];
			var len, i;
			if (typeof array != "undefined") {
				if (indexOf) {
					len = null;
					return indexOf.call(array, obj, i);
				}
				len = array.length;
				i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
				for (; i < len; i++) {
					if (i in array && array[i] === obj) {
						return i;
					}
				}
			}
			return -1;
		},
		each = function(obj, callback, args) {
			if (typeof obj == "undefined") return false;
			if (obj) {
				var value, i = 0,
					length = obj.length || 0,
					isArray = isArraylike(obj);
				if (obj && (typeof obj == "string" || obj.nodeType || obj == global || obj == doc)) {
					return callback.call(obj, 0, obj);
				}
				if (args) {
					if (isArray) {
						for (; i < length; i++) {
							value = callback.apply(obj[i], args);
							if (value === false) {
								break;
							}
						}
					} else {
						for (i in obj) {
							value = callback.apply(obj[i], args);
							if (value === false) {
								break;
							}
						}
					}
				} else {
					if (isArray) {
						for (; i < length; i++) {
							value = callback.call(obj[i], i, obj[i]);
							if (value === false) {
								break;
							}
						}
					} else {
						for (i in obj) {
							value = callback.call(obj[i], i, obj[i]);
							if (value === false) {
								break;
							}
						}
					}
				}
			}
		},
		random = function(mx, mi) { //随机数
			return (typeof mx != "undefined") ? Math.floor(Math.random() * (mx - (mi || 0) + 1) + (mi || 0)) : 0;
		},
		isFunction = function(v) {
			return (v !== null) ? typeof v === "function" && typeof v.call != 'undefined' && _toString.call(v) === '[object Function]' : false;
		},
		easyjs = function() {
			var args = arguments,
				len = args.length;
			if (len == 1)
				return new easyjs.fn.init(args[0]);
			else if (len == 2)
				return new easyjs.fn.init(args[0], args[1]);
		};

	Function.prototype.extend = function( /*key, value*/ ) {
		if (typeof arguments == "undefined") return this;
		var len = arguments.length,
			target = arguments[0] || {},
			key,
			options,
			toArray = function(options) {
				var arg = [];
				if (isArray(options)) {
					arg = options;
				} else {
					for (var i in options) {
						arg.push(i);
					}
				}
				return arg;
			},
			isStr = typeof target == "string" && target.split(' ').length == 1;
		if (isStr) {
			target = this;
			key = arguments[0];
			target[key] = {};
		}
		if (len == 1) {
			target = this;
			if (isParentObject(arguments[0])) {
				each(arguments[0], function(name, fn) {
					target[name] = fn;
				});
			} else if (isFunction(arguments[0])) {
				arguments[0].call(this, arguments[0]);
				return target;
			} else {
				target = arguments[0];
			}
		} else if (len == 2 && typeof arguments[1] != "undefined") {
			if (isParentObject(arguments[1])) {
				each(arguments[1], function(name, fn) {
					(isStr ? target[key] : target)[name] = fn;
				});
			} else if (isStr || (arguments[1] && isArray(arguments[1]))) {
				target[arguments[0]] = arguments[1];
			} else if ((isParentObject(arguments[0]) || typeof arguments[0] == "string") && isFunction(arguments[1])) {
				target = this;
				target.config(arguments[0]);
				target.use(arguments[0], arguments[1]);
			}
		} else if (len == 3 && typeof arguments[0] == "string") {
			target.extend(arguments[0], function() {
				target.config(arguments[1]);
				target.use(arguments[1], arguments[2]);
			});
		}
		return target;
	};
	Function.prototype.implement = function(key, value) {
		this.extend.call(this.prototype, key, value);
		return this;
	};
	String.prototype.capitalize = function() { //转换
		return this.charAt(0).toUpperCase() + this.substr(1);
	};
	var fixurl = function(url) {
		return /^(https|http)\:\/\//.test(url) ? url : /^\.+\//.test(url) ? url.replace(/^\.+\//, easyjs.data.base) : easyjs.data.base + url;
	};
	easyjs.extend("aid", {
		fix: function(name) {
			var path = easyjs.data.alias[name],
				dir, url, configCall,
				type = "default";
			if (typeof path == "string") {
				dir = easyjs.data.paths[path.split('/')[0]] || undefined;
				url = fixurl(dir ? path.replace(path.split('/')[0], dir) : path);
			} else if (isParentObject(path)) {
				url = path.url || "";
				dir = easyjs.data.paths[url.split('/')[0]] || undefined;
				url = fixurl(dir ? url.replace(url.split('/')[0], dir) : url);
				configCall = path.callback || undefined;
				type = path.type || "default";
			} else {
				url = fixurl(name);
			}
			return {
				url: url,
				type: type,
				configCall: configCall
			};
		},
		runSaveCode: function(rdata) {
			var exports = easyjs.data.tempExports = {};
			(window.execScript || function(data) {
				return window["eval"].call(window, data);
			})("(" + easyjs.data[rdata.url].code + ")(easyjs.require, easyjs.data.tempExports, easyjs)");
			easyjs.data[rdata.url].exports = exports;
			return exports;
		},
		parseDependencies: function(code) {
			var ret = [];

			code.replace(easyjs.aid.sMatch.SLASH_RE, "").replace(easyjs.aid.sMatch.REQUIRE_RE, function(m, m1, m2) {
				if (m2 && inArray(m2, ret) < 0) {
					ret.push(m2);
				}
			});

			return ret.length < 1 ? undefined : ret;
		},
		getCurrentScript: function() {
			if (currentlyAddingScript) {
				return currentlyAddingScript;
			}

			// For IE6-9 browsers, the script onload event may not fire right
			// after the the script is evaluated. Kris Zyp found that it
			// could query the script nodes and the one that is in "interactive"
			// mode indicates the current script
			// ref: http://goo.gl/JHfFW
			if (interactiveScript && interactiveScript.readyState === "interactive") {
				return interactiveScript;
			}

			var scripts = head.getElementsByTagName("script");

			for (var i = scripts.length - 1; i >= 0; i--) {
				var script = scripts[i];
				if (script.readyState === "interactive") {
					interactiveScript = script;
					return interactiveScript;
				}
			}
		},
		sMatch: {
			rprandom: /[?|&]random=(\S+)/gi,
			rfile: /\/([^\/]+?[\.js|\.css])(?:\?|$)/i,
			REQUIRE_RE: /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
			SLASH_RE: /\\\\/g
		}
	}).extend("ver", "0.2.20130928202501").extend("config", function(ops) {
		if (isParentObject(ops)) {
			easyjs.extend(easyjs.data, ops);
		}
		return this;
	}).extend("use", function(name, callback) {
		if (typeof name != "string") return this;
		var names = name.split(' ');
		if (names.length == 1 && easyjs.aid.fix(names[0]).url) {
			var url = easyjs.aid.fix(names[0]).url;
			if (url != easyjs.data.base){
				if (easyjs.data[url])
					callback();
				else
					easyjs.loadJs(url, callback);
			}
		} else {
			var i = 0,
				request = function(i, names) {
					if (i + 1 >= names.length) {
						if (callback) callback();
					} else {
						loadFn(i + 1);
					}
				},
				loadFn = function(i) {
					var data = easyjs.aid.fix(names[i]);
					if (data.type == "default") {
						easyjs.loadJs(data.url, function() {
							if (data.configCall) data.configCall();
							request(i, names);
						});
					} else if (data.type == "jsonp") {
						var id = "easyjs_ajax_" + (easyjs.data.ajaxs._count += 1),
							url = data.url + (/\?/.test(data.url) ? "&" : "?") + "cb=" + id;
						global[id] = function(result) {
							global[id] = null;
							easyjs.extend((easyjs.data.ajaxs[id] = {}), {
								url: data.url,
								data: result || undefined,
								status: result ? "ok" : "error"
							});
							if (result) {
								data.configCall(result, "ok");
							} else {
								data.configCall(undefined, "error");
							}
						};
						easyjs.loadJs(url, function() {
							request(i, names);
						});
					}
				};
			loadFn(0);
		}
		return this;
	}).extend("require", function(name) {
		var rdata = easyjs.aid.fix(name),
			exports = easyjs.data.tempExports = {},
			obj = easyjs.data[rdata.url];
		if (obj && obj.code) {
			if (obj.status == 2 && !isEmptyObject(obj.exports)) {
				exports = obj.exports;
			} else {
				exports = easyjs.aid.runSaveCode(rdata) || {};
			}
			return exports;
		}
	});

	each(["js", "css"], function(i, name) {
		easyjs.extend("load" + name.capitalize(), function(url, callback, options) {
			if (typeof url == "undefined") return this;
			options = options || {};
			var head = doc.getElementsByTagName('head')[0] || docElem,
				type = name,
				dom = doc.createElement(type == "js" ? 'script' : 'link'),
				done = false,
				isSiteUri = typeof _SITE_ != "undefined",
				regFile = easyjs.aid.sMatch.rfile.exec(url);
			options.id = options.id ? options.id : regFile ? "easyjs_" + regFile[1].replace(/.js|.css/gi, "") : (type == "js" ? "easyjs_loadJs" : "easyjs_loadCss") + random(10000, 0);
			options.code = isSiteUri && typeof _SITE_.version != "undefined" ? "ver=" + _SITE_.version.js : "random=" + random(10000, 0);
			if (type == "js") {
				if (easyjs.data[url] && easyjs.data[url].code) {
					var exports = easyjs.aid.runSaveCode({
						url: url
					});
					if (callback) {
						setTimeout(function() {
							callback();
						}, type == "js" ? 20 : 1);
					}
					return this;
				}
				options.async = "true";
				options.src = url + (isSiteUri && typeof _SITE_.urls.js != "undefined" && url.indexOf(_SITE_.urls.js) > -1 ? "" : (/\?/.test(url) ? "&" : "?") + options.code);
				if ("charset" in dom) {
					options.charset = options['charset'] || "utf-8";
				}
				each(options, function(attr, value) {
					dom[attr] = value || "";
				});
				activeScript = dom.src.replace(easyjs.aid.sMatch.rprandom, "");
				easyjs.data[activeScript] = {
					code: undefined,
					dependencies: undefined,
					status: 0,
					exports: {},
					url: activeScript,
					id: activeScript
				};
				currentlyAddingScript = dom;
			} else {
				each({
					rel: 'stylesheet',
					type: 'text/css',
					href: url + (isSiteUri && typeof _SITE_.urls.css != "undefined" && url.indexOf(_SITE_.urls.css) > -1 ? "" : (/\?/.test(url) ? "&" : "?") + options.code),
					id: options.id
				}, function(attr, value) {
					dom[attr] = value;
				});
			}
			dom.onerror = dom.onload = dom.onreadystatechange = function() {
				if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					var url = (this.href||this.src).replace(easyjs.aid.sMatch.rprandom, "");
					easyjs.extend(easyjs.data[url], {
						status: 1
					});
					done = true;
					if (callback) {
						setTimeout(function() {
							callback();
						}, type == "js" ? 20 : 1);
					}
					dom.onerror = dom.onload = dom.onreadystatechange = null;
					if (type == "js") currentlyAddingScript = undefined;
					if (easyjs.data.debug === false) head.removeChild(dom);
				}
			};
			head.insertBefore(dom, head.firstChild);
			return this;
		});
	});

	easyjs.implement("init", function() {
		var args = arguments,
			len = args.length,
			kasr = easyjs.aid.sMatch.rprandom;
		if (!activeScript) {
			activeScript = easyjs.aid.getCurrentScript().src.replace(kasr, "");
		}
		activeScript = activeScript.replace(kasr, "");
		var datas = easyjs.data[activeScript];
		if (len == 1) {
			if (isParentObject(args[0])) {
				easyjs.config(args[0]).extend(datas, {
					code: args[0],
					dependencies: undefined,
					status: 2
				});
			} else if (isFunction(args[0])) {
				var argStr = args[0].toString();
				easyjs.extend(datas, {
					code: argStr.replace(/\r|\n|\s{2,}/gi, ""),
					dependencies: easyjs.aid.parseDependencies(argStr),
					status: 2,
					exports: {}
				});
				easyjs.use((datas.dependencies && datas.dependencies.join(' ') || ""), function() {
					var require = easyjs.require,
						fexports = {},
						module = easyjs;
					args[0](require, fexports, module);
					if (datas.code && args[0].toString().replace(/\r|\n|\s{2,}/gi, "") && isEmptyObject(datas.exports)) {
						easyjs.extend(datas, {
							exports: fexports
						});
					}
				});
			}
		} else if (len == 2) {
			easyjs.use(args[0], args[1]);
		}
	});

	easyjs.fn = easyjs.prototype;
	easyjs.fn.init.prototype = easyjs.fn;

	global.easyjs = easyjs;
	global.define = function() {
		var args = arguments,
			len = args.length;
		if (len == 1)
			easyjs(args[0]);
		else if (len == 2)
			easyjs(args[0], args[1]);
	};

	var loadeasyjs = doc.getElementById("easyjsroot"),
		config;
	if (!loadeasyjs) {
		var scripts = doc.getElementsByTagName('script');
		loadeasyjs = scripts[scripts.length - 1];
	}
	easyjs.data = {
		base: loadeasyjs.src ? (/((.+[\/].+)+?|)\/libs\/(easyjs.+?)\.js/.exec(loadeasyjs.getAttribute("src"))[1] || /((.+[\/].+)+?|)\//.exec(global.location.href)[1]) + "/" : "",
		debug: true,
		ajaxs: {
			_count: 0
		},
		alias: {},
		paths: {}
	};
	config = loadeasyjs.getAttribute("data-config") || undefined;
	if (config) {
		easyjs.loadJs(config, function() {
			easyjs.use([easyjs.data["frame"], (loadeasyjs.getAttribute("data-main") || easyjs.data["main"])].join(' '));
		});
	}

})(this);