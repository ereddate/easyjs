(function(global, undefined) {
	if (global.CollectGarbage) CollectGarbage();
	var doc = global.document,
		_toString = Object.prototype.toString,
		docElem = doc.documentElement,
		hasOwn = Object.prototype.hasOwnProperty,
		indexOf = Array.prototype.indexOf,
		currentlyAddingScript,
		interactiveScript,
		anycode,
		fixUndefined = typeof undefined,
		cache = {},
		sMatch = {
			rprandom: /[?|&]random=(\S+)/gi,
			rfile: /\/([^\/]+?[\.js|\.css])(?:\?|$)/i,
			REQUIRE_RE: /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
			SLASH_RE: /\\\\/g,
			DOT_RE: /\/\.\//g,
			DOUBLE_DOT_RE: /\/[^\/]+\/\.\.\//,
			DOUBLE_SLASH_RE: /([^:\/])\/\//g
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
		fixArray = function(arr, inarr) {
			if (typeof inarr == fixUndefined) return arr;
			each(arr, function(i, value) {
				inarr.push(value);
			});
			return inarr;
		},
		isEmptyObject = function(e) {
			var t;
			for (t in e) return !1;
			return !0
		},
		isArray = function(v) {
			return typeof v !== fixUndefined ? (v.constructor == Array) ? true : false : false;
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
		random = function(max, min) { //随机数
			return typeof max != fixUndefined ? Math.floor(Math.random() * (max - (min || 0) + 1) + (min || 0)) : 0;
		},
		isFunction = function(v) {
			return typeof v != fixUndefined ? typeof v === "function" && typeof v.call != fixUndefined && _toString.call(v) === '[object Function]' : false;
		},
		realpath = function(path) {
			// /a/b/./c/./d ==> /a/b/c/d
			path = path.replace(sMatch.DOT_RE, "/")
			// a/b/c/../../d  ==>  a/b/../d  ==>  a/d
			while (path.match(sMatch.DOUBLE_DOT_RE)) {
				path = path.replace(sMatch.DOUBLE_DOT_RE, "/")
			}
			// a//b/c  ==>  a/b/c
			path = path.replace(sMatch.DOUBLE_SLASH_RE, "$1/")
			return path
		},
		fixurl = function(url) {
			if (typeof url == fixUndefined) return;
			if (/^\/\//.test(url.replace(location.protocol, ""))) return /^\/\//.test(url) ? location.protocol + url : url;
			url = url.split('\/')[0] && easyjs.config["paths"][url.split('\/')[0]] ? url.replace(url.split('\/')[0], easyjs.config["paths"][url.split('\/')[0]]) : url;
			var first = url.charAt(0);
			if (first == ".") {
				url = realpath(easyjs.config.base + url);
			} else if (first == "/") {
				url = easyjs.config.base.replace(location.protocol + "//", "").split('/').slice(0, 1).join('/') + url;
			} else if (url.indexOf(location.protocol) < 0 && /^\/\//.test(url) || /^(\/\/|)((.+[\:].+)|(.+[\.].+[\.].+))[\/]/.test(url)) {
				url = location.protocol + (/^\/\//.test(url) ? "" : "//") + url;
			} else {
				url = easyjs.config.base + url;
			}
			if (url.indexOf(location.protocol) < 0) {
				url = location.protocol + (/\/\//.test(url) ? "" : "//") + url;
			}
			return url;
		},
		fixArray = function(arr, inarr) {
			if (typeof inarr == fixUndefined) return arr;
			each(arr, function(i, value) {
				inarr.push(value);
			});
			return inarr;
		},
		fix = function(name) {
			var path = easyjs.config.alias[name] || easyjs.config.preload[name],
				dir, url, configCall,
				type = "default";

			if (path) {
				url = isParentObject(path) ? path.url : path;
				dir = easyjs.config.paths[url.split('/')[0]] || false;
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
		parseDependencies = function(code) {
			var ret = [];

			code.replace(sMatch.SLASH_RE, "").replace(sMatch.REQUIRE_RE, function(m, m1, m2) {
				if (m2 && inArray(m2, ret) < 0) {
					ret.push(m2);
				}
			});

			return ret.length < 1 ? false : ret;
		},
		getCurrentScript = function() {
			if (currentlyAddingScript) {
				return currentlyAddingScript;
			}
			if (interactiveScript && interactiveScript.readyState === "interactive") {
				return interactiveScript;
			}
			var head = doc.getElementsByTagName("head")[0];
			var scripts = head.getElementsByTagName("script");

			for (var i = scripts.length - 1; i >= 0; i--) {
				var script = scripts[i];
				if (script.readyState === "interactive") {
					interactiveScript = script;
					return interactiveScript;
				}
			}
		},
		fxEval = function(code, args) {
			return (window.execScript || function(data) {
				return window["eval"].call(window, data);
			})("(" + code + ")" + (args ? "(" + args + ")" : ""));
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
		extend = function(mod, ext) {
			var target = mod || {};
			if (typeof mod == "string") {
				target = this;
				target[mod] = ext;
			} else if (isArray(ext) || isParentObject(ext)) {
				each(ext, function(name, value) {
					target[name] = value;
				});
			}
			return target;
		};

	var obj = function(id, deps) {
		extend(this, {
			id: id,
			uri: id,
			dependencies: (function(d) {
				var a = [];
				each(d, function(i, name) {
					a.push(fix(name).url || "");
				});
				return a;
			})(deps)
		});
		return this;
	};

	obj.prototype = {
		load: function(url, callback) {
			url = url || this.uri;
			callback = callback || this.callback;
			var isCss = /\.css(?:\?|$)/i.test(url);
			if (isCss || easyjs.data[url] && easyjs.data[url].status == 0) {
				var head = doc.getElementsByTagName("head")[0],
					dom = doc.createElement(!isCss ? "script" : "link"),
					options = extend({}, (isCss ? {
						rel: 'stylesheet',
						type: 'text/css',
						href: url,
						id: url,
						media: "all"
					} : {
						async: "true",
						src: url,
						charset: easyjs.config.charset || "utf-8",
						id: url
					}));
				each(options, function(name, value) {
					dom[name] = value;
				});
				currentlyAddingScript = dom;
				dom.onerror = function() {
					dom.onerror = null;
					if (callback) callback();
					easyjs.data[(this.href || this.src)].status = 2;
					if (!isCss) {
						if (!easyjs.config.debug) head.removeChild(dom);
					}
				};
				dom.onload = dom.onreadystatechange = function() {
					if ((!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
						currentlyAddingScript = null;
						dom.onload = dom.onreadystatechange = null;
						if (callback) callback();
						easyjs.data[(this.href || this.src)].status = 2;
						if (!isCss) {
							if (!easyjs.config.debug) head.removeChild(dom);
						}
					}
				};
				var base = head.getElementsByTagName("base")[0];
				base ? head.insertBefore(dom, base) : head.appendChild(dom);
			} else {
				callback();
			}
		}
	};

	obj.config = function(ops) {
		extend(this.config, ops);
	};

	obj.get = function(id, deps) {
		return cache[id] || (cache[id] = new obj(id, isArray(deps) ? deps : [deps]))
	};

	obj.define = function(id, dependencies, callback) {
		if (isFunction(id)) {
			var code = id.toString(),
				dependencies = (function(deps) {
					each(deps, function(i, value) {
						deps[i] = fix(value).url;
					});
					return deps;
				})(parseDependencies(code) || []),
				meta = {
					id: null,
					uri: null,
					code: code,
					dependencies: dependencies
				};
			if (!meta.id && doc.attachEvent) {
				var script = getCurrentScript();
				if (script) {
					meta.uri = script.src;
					id = script.src;
				}
			}
			if (meta.id) {
				extend(cache[meta.id], meta);
			} else {
				anycode = meta;
			}

		} else if (isParentObject(id)) {
			extend(easyjs.config, id);
		}
	};

	obj.require = function(id) {
		var id = fix(id) ? fix(id).url : id,
			go = easyjs.data[id],
			exports;
		if (go) {
			exports = go.exports || {};
		}
		return exports;
	};

	obj.use = function(id, dependencies, callback) {
		if (typeof dependencies == fixUndefined) dependencies = [];
		if (isFunction(dependencies)) {
			callback = dependencies;
			dependencies = [];
		}
		id = fix(id).url;
		var isCss = /\.css(?:\?|$)/i.test(id),
			mod = obj.get(id, dependencies),
			options = {
				id: id,
				dependencies: [],
				exports: null,
				uri: id,
				status: 0
			};
		extend(options, {
			dependencies: !isCss ? mod.dependencies.length > 0 ? mod.dependencies : dependencies : []
		});
		easyjs.data[id] = options;
		mod.callback = function() {
			if (!isCss) {
				var id = mod.id,
					exports = anycode ? anycode.exports : cache[id].exports,
					dependencies = anycode && anycode.dependencies.length > 0 ? anycode.dependencies : cache[id].dependencies,
					code = anycode && anycode.code ? anycode.code : cache[id].code;
				cache[id].code = code;
				anycode = null;
				extend(easyjs.data[id], {
					dependencies: dependencies,
					status: 1,
					exports: exports
				});
				if (code) {
					if (dependencies.length > 0) {
						easyjs.use(dependencies.join(' '), function() {
							var list = dependencies.slice(),
								codes = (function(list) {
									var codes = [];
									each(list, function(i, name) {
										codes.push(cache[name].code);
									});
									return codes;
								})(list);
							list.push(id);
							codes.push(code);
							each(codes, function(i, scode) {
								var exports = fxEval(scode, "easyjs.require, (easyjs.data.tempExport = {}), easyjs");
								if (isFunction(exports) || isParentObject(exports) && !isEmptyObject(exports) || typeof exports == "string" || isArray(exports)) {
									if (easyjs.data[list[i]]) easyjs.data[list[i]].exports = exports;
								} else {
									if (easyjs.data[list[i]]) easyjs.data[list[i]].exports = easyjs.data.tempExport;
								}
							});
							if (callback) callback();
							delete mod.callback;
						});
						return;
					} else {
						var exports = fxEval(code, "easyjs.require, (easyjs.data.tempExport = {}), easyjs");
						if (isFunction(exports) || isParentObject(exports) && !isEmptyObject(exports) || typeof exports == "string" || isArray(exports)) {
							easyjs.data[id].exports = exports;
						} else {
							easyjs.data[id].exports = easyjs.data.tempExport;
						}
					}
				}
			}
			if (callback) callback();
			delete mod.callback;
		};
		mod.load();
	};

	obj.init = function(id, dependencies, callback) {
		if (isFunction(dependencies)) {
			callback = dependencies;
			dependencies = [];
		}
		var deps = isArray(dependencies) ? dependencies.slice() : [];
		deps = fixArray(deps, id.split(' '));
		new sequence(deps, callback);
	};

	var easyjs = function(id, dependencies, callback) {
		define(id, dependencies, callback);
		return this;
	};

	var sequence = function(names, callback) {
		if (names.length > 0) {
			this.i = 0;
			var request = function(i, names) {
				if (i + 1 >= names.length) {
					if (callback) callback();
				} else {
					loadFn(i + 1);
				}
			},
				loadFn = function(i) {
					var data = fix(names[i]),
						isJs = /\.js/.test(data.url);
					obj.use(data.url, function() {
						if (data.configCall) data.configCall();
						request(i, names);
					});
				};
			loadFn(this.i);
		}
	};

	String.prototype.capitalize = function() { //转换
		return this.charAt(0).toUpperCase() + this.substr(1);
	};

	extend(easyjs, {
		data: {},
		config: function(ops) {
			obj.config.call(easyjs, ops);
			return this;
		},
		require: function(id) {
			return obj.require(id);
		},
		use: function(id, dependencies, callback) {

			obj.init(id, dependencies, callback);

			return this;
		},
		extend: function(mod, ext) {
			return extend.call(this, mod, ext);
		}
	});

	each(["js", "css"], function(i, name) {
		easyjs.extend("load" + name.capitalize(), function(url, callback) {
			if (typeof url == fixUndefined) return this;
			easyjs.use(url, callback);
			return this;
		});
	});

	global.easyjs = easyjs;
	global.define = obj.define;

	var loadeasyjs = doc.getElementById("easyjsroot");
	if (!loadeasyjs) {
		var scripts = doc.getElementsByTagName('script');
		loadeasyjs = scripts[scripts.length - 1];
	}
	if (loadeasyjs) {
		extend(easyjs.config, {
			base: loadeasyjs.src ? (/((.+[\/].+)+?|)\/libs\/(easyjs.+?)\.js/.exec(loadeasyjs.getAttribute("src"))[1] || /((.+[\/].+)+?|)\//.exec(global.location.href)[1]) + "/" : "",
			debug: true,
			frame: "",
			main: "",
			ajaxs: {
				_count: 0
			},
			charset: "utf-8",
			alias: {},
			paths: {},
			preload: []
		});
		var config = loadeasyjs.getAttribute("data-config") || false;
		if (config) {
			easyjs.use(config, function() {
				var loads = easyjs.config["frame"] ? [easyjs.config["frame"]] : [],
					main = loadeasyjs.getAttribute("data-main") || easyjs.config["main"] || false,
					modules = loadeasyjs.getAttribute("data-file") && loadeasyjs.getAttribute("data-file").split(' ') || easyjs.config["preload"] || [];
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