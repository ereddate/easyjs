(function(global, undefined) {
	if (global.CollectGarbage) CollectGarbage();
	var doc = global.document,
		_toString = Object.prototype.toString,
		docElem = doc.documentElement,
		hasOwn = Object.prototype.hasOwnProperty,
		indexOf = Array.prototype.indexOf,
		activeScript,
		currentlyAddingScript,
		interactiveScript,
		// Support: IE<10
		// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
		fixUndefined = typeof undefined,

		isArray = function(v) {
			return typeof v !== fixUndefined ? (v.constructor == Array) ? true : false : false;
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
			return (typeof key == fixUndefined) || hasOwn.call(obj, key);
		},
		isEmptyObject = function(e) {
			var t;
			for (t in e) return !1;
			return !0
		},
		inArray = function(obj, array) {
			array = array ? array : this[0];
			var len, i;
			if (typeof array != fixUndefined) {
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
			if (typeof obj == fixUndefined) return false;
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
		random = function(max, min) { //随机数
			return typeof max != fixUndefined ? Math.floor(Math.random() * (max - (min || 0) + 1) + (min || 0)) : 0;
		},
		isFunction = function(v) {
			return typeof v != fixUndefined ? typeof v === "function" && typeof v.call != fixUndefined && _toString.call(v) === '[object Function]' : false;
		},
		realpath = function(path) {
			// /a/b/./c/./d ==> /a/b/c/d
			path = path.replace(easyjs.aid.sMatch.DOT_RE, "/")
			// a/b/c/../../d  ==>  a/b/../d  ==>  a/d
			while (path.match(easyjs.aid.sMatch.DOUBLE_DOT_RE)) {
				path = path.replace(easyjs.aid.sMatch.DOUBLE_DOT_RE, "/")
			}
			// a//b/c  ==>  a/b/c
			path = path.replace(easyjs.aid.sMatch.DOUBLE_SLASH_RE, "$1/")
			return path
		},
		fixurl = function(url) {
			if (/^\/\//.test(url.replace(location.protocol, ""))) return /^\/\//.test(url) ? location.protocol + url : url;
			url = url.split('\/')[0] && easyjs.data["paths"][url.split('\/')[0]] ? url.replace(url.split('\/')[0], easyjs.data["paths"][url.split('\/')[0]]) : url;
			var first = url.charAt(0);
			if (first == ".") {
				url = realpath(easyjs.data.base + url);
			} else if (first == "/") {
				url = easyjs.data.base.replace(location.protocol + "//", "").split('/').slice(0, 1).join('/') + url;
			} else if (url.indexOf(easyjs.data.base.replace(location.protocol + "//", "")) == 0) {
				url = location.protocol + "//" + url;
			} else {
				url = easyjs.data.base + url;
			}
			if (url.indexOf(location.protocol) < 0) {
				url = location.protocol + (/\/\//.test(url) ? "" : "//") + url;
			}
			return url;
		},
		easyjs = function() {
			var args = arguments,
				len = args.length;
			if (len == 1)
				return new easyjs.fn.init(args[0]);
			else if (len == 2)
				return new easyjs.fn.init(args[0], args[1]);
			else if (len == 3)
				return new easyjs.fn.init(args[0], args[1], args[2]);
		};

	Function.prototype.extend = function( /*key, value*/ ) {
		if (typeof arguments == fixUndefined) return this;
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
		} else if (len == 2 && typeof arguments[1] != fixUndefined) {
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

	easyjs.extend("aid", {
		fixArray: function(arr, inarr) {
			if (typeof inarr == fixUndefined) return arr;
			each(arr, function(i, value) {
				inarr.push(value);
			});
			return inarr;
		},
		fix: function(name) {
			var path = easyjs.data.alias[name] || easyjs.data.preload[name],
				dir, url, configCall,
				type = "default";

			if (path) {
				url = isParentObject(path) ? path.url : path;
				dir = easyjs.data.paths[url.split('/')[0]] || false;
				url = fixurl(dir ? url.replace(url.split('/')[0], dir) : url);
				if (isParentObject(path)) {
					configCall = path.callback || false;
					type = path.type || "default";
				}
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

			return ret.length < 1 ? false : ret;
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
			SLASH_RE: /\\\\/g,
			DOT_RE: /\/\.\//g,
			DOUBLE_DOT_RE: /\/[^\/]+\/\.\.\//,
			DOUBLE_SLASH_RE: /([^:\/])\/\//g
		}
	}).extend("ver", "0.2.20130928202501").extend("config", function(ops) {
		if (isParentObject(ops)) {
			easyjs.extend(easyjs.data, ops);
		}
		return this;
	}).extend("use", function(name, callback, dependence) {
		if (typeof name != "string") return this;
		var args = arguments,
			len = args.length,
			names = name.split(' ');
		if (isArray(args[1])) {
			var dcallback = isFunction(dependence) ? dependence : function() {};
			dependence = callback;
			callback = dcallback;
		}
		names = dependence && dependence.length > 0 ? easyjs.aid.fixArray(names, dependence) : names;
		if (names.length == 1 && easyjs.aid.fix(names[0]).url) {
			var url = easyjs.aid.fix(names[0]).url;
			if (url != easyjs.data.base) {
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
								data: result || false,
								status: result ? "ok" : "error"
							});
							if (result) {
								data.configCall(result, "ok");
							} else {
								data.configCall(false, "error");
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
			if (typeof url == fixUndefined) return this;
			options = options || {};
			var head = doc.getElementsByTagName('head')[0] || docElem,
				type = name,
				dom = doc.createElement(type == "js" ? 'script' : 'link'),
				done = false,
				regFile = easyjs.aid.sMatch.rfile.exec(url);
			options.id = options.id ? options.id : regFile && regFile[1] ? (/easyjs_/.test(regFile[1]) ? "easyjs_" : "") + regFile[1].replace(/\.js|\.css/gi, "") : (type == "js" ? "easyjs_loadJs" : "easyjs_loadCss") + random(10000, 0);
			options.id = options.id.replace(/\./gi, "_");
			options.code = options.code ? options.code : "random=" + random(10000, 0);
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
				options.src = url + (/\?/.test(url) ? "&" : "?") + options.code;
				if ("charset" in dom) {
					options.charset = options['charset'] || easyjs.data["charset"] || "utf-8";
				}
				each(options, function(attr, value) {
					dom[attr] = value || "";
				});
				activeScript = dom.src.replace(easyjs.aid.sMatch.rprandom, "");
				easyjs.data[activeScript] = {
					code: null,
					dependencies: null,
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
					href: url + (/\?/.test(url) ? "&" : "?") + options.code,
					id: options.id
				}, function(attr, value) {
					dom[attr] = value;
				});
			}
			dom.onerror = dom.onload = dom.onreadystatechange = function() {
				if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					dom.onerror = dom.onload = dom.onreadystatechange = null;
					var url = (this.href || this.src).replace(easyjs.aid.sMatch.rprandom, "");
					easyjs.extend(easyjs.data[url], {
						status: 1
					});
					done = true;
					if (callback) {
						setTimeout(function() {
							callback();
						}, type == "js" ? 20 : 1);
					}
					if (type == "js") currentlyAddingScript = null;
					if (easyjs.data.debug === false) head.removeChild(dom);
				}
			};
			var base = head.getElementsByTagName("base")[0];
			base ? head.insertBefore(dom, base) : head.appendChild(dom);
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
					dependencies: null,
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
				var dependencie = datas.dependencies && datas.dependencies.join(' ') || false,
					callback = function() {
						var require = easyjs.require,
							fexports = {},
							module = easyjs;
						args[0](require, fexports, module);
						if (datas.code && args[0].toString().replace(/\r|\n|\s{2,}/gi, "") && isEmptyObject(datas.exports)) {
							easyjs.extend(datas, {
								exports: fexports
							});
						}
					};
				if (dependencie) {
					easyjs.use(dependencie, callback);
				} else {
					callback();
				}
			}
		} else if (len == 2) {
			easyjs.use(args[0], args[1]);
		} else if (len == 3) {
			easyjs.use(args[0], args[2], args[1]);
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
		else if (len == 3)
			easyjs(args[0], args[1], args[2]);
	};

	var loadeasyjs = doc.getElementById("easyjsroot"),
		config;
	if (!loadeasyjs) {
		var scripts = doc.getElementsByTagName('script');
		loadeasyjs = scripts[scripts.length - 1];
	}
	if (loadeasyjs) {
		easyjs.data = {
			base: loadeasyjs.src ? (/((.+[\/].+)+?|)\/libs\/(easyjs.+?)\.js/.exec(loadeasyjs.getAttribute("src"))[1] || /((.+[\/].+)+?|)\//.exec(global.location.href)[1]) + "/" : "",
			debug: true,
			ajaxs: {
				_count: 0
			},
			alias: {},
			paths: {},
			preload: []
		};
		config = loadeasyjs.getAttribute("data-config") || false;
		if (config) {
			easyjs.loadJs(config, function() {
				var loads = easyjs.data["frame"] ? [easyjs.data["frame"]] : [],
					main = loadeasyjs.getAttribute("data-main") || easyjs.data["main"] || false,
					modules = loadeasyjs.getAttribute("data-file") && loadeasyjs.getAttribute("data-file").split(' ') || easyjs.data["preload"] || [];
				if (modules.length > 0) {
					loads = (loads.join(' ') + (loads.length > 0 ? ' ' : '') + modules.join(' ')).split(' ');
				}
				if (main) {
					loads.push(main);
				}
				easyjs.use(loads.join(' '));
			});
		}
	}
})(this, undefined);