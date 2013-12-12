(function(global, undefined) {
	if (global.CollectGarbage) CollectGarbage();
	var doc = global.document,
		_toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		indexOf = Array.prototype.indexOf,
		currentlyAddingScript,
		interactiveScript,
		anycode,
		fixUndefined = typeof undefined,
		ua = global.navigator.userAgent.toLowerCase(),
		isTouch = /android|ipad|iphone|ipod|mobile|touch|tablet|kindle|blackberry|touchpad/.test(ua),
		cache = {},
		sMatch = {
			REQUIRE_RE: /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
			SLASH_RE: /\\\\/g,
			DOT_RE: /\/\.\//g,
			DOUBLE_DOT_RE: /\/[^\/]+\/\.\.\//,
			DOUBLE_SLASH_RE: /([^:\/])\/\//g
		},
		getsrc = function(node) {
			return node.hasAttribute ? // non-IE6/7
			(node.href || node.src) :
			// see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
			(node.getAttribute("href", 4) || node.getAttribute("src", 4))
		},
		stringify = function(str) {
			if (str == null) {
				return 'null';
			}
			if (typeof str != 'string' && str.toJSON) {
				return str.toJSON();
			}
			var type = (function(o) {
				if (o != null && o.constructor != null) {
					return Object.prototype.toString.call(o).slice(8, -1);
				} else if (isFunction(o)) {
					return "function";
				} else {
					return '';
				}
			})(str).toLowerCase();
			switch (type) {
				case 'string':
					return '"' + escapeChars(str) + '"';
				case 'number':
					return str.toString();
				case 'boolean':
					return str.toString();
				case 'date':
					return 'new Date(' + str.getTime() + ')';
				case 'array':
					var ar = [];
					for (var i = 0; i < str.length; i++) {
						ar[i] = stringify(str[i]);
					}
					return '[' + ar.join(',') + ']';
				case 'object':
					if (isParentObject(str)) {
						var ar = [];
						for (i in str) {
							ar.push('"' + escapeChars(i) + '":' + stringify(str[i]));
						}
						return '{' + ar.join(',') + '}';
					}
				case 'function':
					return str.toString();
			}
			return 'null';
		},
		escapeChars = function(s) {
			return (function(s, arr) {
				for (var i = 0; i < arr.length; i++) {
					s = s.replace(arr[i][0], arr[i][1]);
				}
				return s;
			})(s, [
				[/\\/g, "\\\\"],
				[/"/g, "\\\""],
				[/\r/g, "\\r"],
				[/\n/g, "\\n"],
				[/\t/g, "\\t"]
			]);
		},
		inArray = function(obj, array) {
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
		isEmpty = function(v) {
			return typeof v == fixUndefined || v == null || typeof v == "string" && v.trim() == "" || isArray(v) && v.length == 0 || typeof v == "object" && (function(e) {
				var t;
				for (t in e) return !1;
				return !0
			})(v) ? true : false;
		},
		isArray = function(v) {
			return typeof v !== fixUndefined && v.constructor == Array ? true : false;
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
			url = url.split('\/')[0] && easyjs.config.data["paths"][url.split('\/')[0]] ? url.replace(url.split('\/')[0], easyjs.config.data["paths"][url.split('\/')[0]]) : url;
			var first = url.charAt(0);
			if (first == ".") {
				url = realpath(easyjs.config.data.base + url);
			} else if (first == "/") {
				url = easyjs.config.data.base.replace(location.protocol + "//", "").split('/').slice(0, 1).join('/') + url;
			} else if (url.indexOf(location.protocol) < 0 && /^\/\//.test(url) || /^(\/\/|)((.+[\:].+)|(.+[\.].+[\.].+))[\/]/.test(url)) {
				url = location.protocol + (/^\/\//.test(url) ? "" : "//") + url;
			} else {
				url = easyjs.config.data.base + url;
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
			var path = easyjs.config.data.alias[name] || easyjs.config.data.preload[name],
				dir, url, configCall,
				type = "default";

			if (isParentObject(path)) {
				path = isTouch ? path.touch : path.global;
			}
			if (path) {
				url = isParentObject(path) ? path.url : path;
				dir = easyjs.config.data.paths[url.split('/')[0]] || false;
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
		mix = function(mod, ext, logic, othext) {
			var target = mod || {};
			if (logic && logic()) {
				ext = mix(ext, othext);
			}
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
		mix(this, {
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
			var self = this,
				isCss = /\.css(?:\?|$)/i.test(url);
			if (isCss || easyjs.cache[url] && easyjs.cache[url].status == 0) {
				var head = doc.getElementsByTagName("head")[0],
					dom = doc.createElement(!isCss ? "script" : "link"),
					options = mix({}, (isCss ? {
						rel: 'stylesheet',
						type: 'text/css',
						href: url,
						id: url,
						media: "all"
					} : {
						async: "true",
						src: url,
						charset: easyjs.config.data.charset || "utf-8",
						id: url
					}));
				each(options, function(name, value) {
					dom[name] = value;
				});
				currentlyAddingScript = dom;
				dom.onerror = function() {
					dom.onerror = null;
					if (callback) callback.call(self);
					easyjs.cache[getsrc(this)].status = 2;
					if (!isCss) {
						if (!easyjs.config.data.debug) head.removeChild(dom);
					}
				};
				dom.onload = dom.onreadystatechange = function() {
					if ((!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
						currentlyAddingScript = null;
						dom.onload = dom.onreadystatechange = null;
						if (callback) callback.call(self);
						easyjs.cache[getsrc(this)].status = 2;
						if (!isCss) {
							if (!easyjs.config.data.debug) head.removeChild(dom);
						}
					}
				};
				var base = head.getElementsByTagName("base")[0];
				base ? head.insertBefore(dom, base) : head.appendChild(dom);
			} else {
				callback.call(self);
			}
		}
	};

	obj.config = function(ops) {
		mix(this.config.data, ops);
	};

	obj.get = function(id, deps) {
		return cache[id] || (cache[id] = new obj(id, isArray(deps) ? deps : [deps]))
	};

	obj.define = function(id, dependencies, factory) {
		var args = arguments,
			len = args.length,
			id, dependencies, factory, meta, code;
		if (len == 0) return;
		if (len == 1) {
			factory = isFunction(args[0]) ? args[0] : 'function(require, exports, module) {return ' + stringify(args[0]) + ';}';
			id = undefined;
			dependencies = undefined;
		} else if (len == 2) {
			if (isFunction(args[1])) {
				if (isArray(args[0])) {
					id = undefined;
					dependencies = args[0];
					factory = args[1];
				} else if (typeof args[0] == "string") {
					id = args[0];
					dependencies = undefined;
					factory = args[1];
				}
			}
		} else if (len == 3) {
			id = typeof args[0] == "string" ? args[0] : undefined;
			dependencies = typeof args[1] == "string" ? args[1].split(' ') : isArray(args[1]) ? args[1] : undefined;
			factory = isFunction(args[2]) ? args[2] : undefined;
		}
		code = isFunction(factory) ? factory.toString() : typeof factory == "string" ? factory : undefined;
		dependencies = dependencies || (function(deps) {
			each(deps, function(i, value) {
				deps[i] = fix(value).url;
			});
			return deps;
		})(code && parseDependencies(code) || []);
		id = id && fix(id).url || undefined;
		meta = {
			id: id,
			uri: id,
			factory: factory,
			dependencies: dependencies
		};
		if (!meta.id && doc.attachEvent) {
			var script = getCurrentScript();
			if (script) {
				meta.uri = getsrc(script);
				id = getsrc(script);
			}
		}
		if (meta.id) {
			mix(cache[meta.id], meta);
		} else {
			anycode = meta;
		}
	};

	obj.require = function(id, callback) {
		if (typeof id == fixUndefined) return;
		var go = easyjs.cache[fix(id) ? fix(id).url : id],
			exports;
		if (go) {
			exports = go.exports || {};
			if (callback) callback(exports);
		}
		return exports;
	};

	obj.use = function(id, dependencies, factory) {
		if (typeof id == fixUndefined) return;
		if (typeof dependencies == fixUndefined) dependencies = [];
		if (isFunction(dependencies)) {
			factory = dependencies;
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
				status: 0,
				factory: null
			};
		mix(options, {
			dependencies: !isCss ? mod.dependencies.length > 0 ? mod.dependencies : dependencies : []
		});
		easyjs.cache[id] = options;
		mod.eval = function(code, id) {
			var exports = (code ? code : cache[id] && cache[id].factory)(easyjs.require, (easyjs.cache.tempExport = {}), easyjs);
			if (easyjs.cache[id]) {
				if (!isEmpty(exports)) {
					easyjs.cache[id].exports = exports;
				} else {
					easyjs.cache[id].exports = easyjs.cache.tempExport;
				}
			}
		};
		mod.callback = function() {
			var self = this;
			if (!isCss) {
				var id = mod.id,
					exports = anycode ? anycode.exports : cache[id].exports,
					dependencies = anycode && anycode.dependencies.length > 0 ? anycode.dependencies : cache[id].dependencies,
					code = anycode && anycode.factory ? anycode.factory : cache[id].factory;
				cache[id].factory = code;
				anycode = null;
				mix(easyjs.cache[id], {
					dependencies: dependencies,
					status: 1,
					exports: exports,
					factory: code
				});
				if (code) {
					if (dependencies.length > 0) {
						easyjs.use(dependencies.join(' '), function() {
							var list = dependencies.slice(),
								codes = (function(list) {
									var codes = [];
									each(list, function(i, name) {
										codes.push(cache[name].factory);
									});
									return codes;
								})(list);
							list.push(id);
							codes.push(code);
							each(codes, function(i, scode) {
								self.eval(scode, list[i]);
							});
							if (factory) factory();
							delete mod.callback;
						});
						return;
					} else {
						self.eval(code, id);
					}
				}
			}
			if (factory) factory();
			delete mod.callback;
		};
		mod.load();
	};

	obj.init = function(id, dependencies, factory) {
		if (isFunction(dependencies)) {
			factory = dependencies;
			dependencies = [];
		}
		sequence(fixArray(isArray(dependencies) ? dependencies.slice() : [], id.split(' ')), factory);
	};

	var sequence = function(names, callback) {
		if (names.length > 0) {
			return new sequence.fn.init(names, callback);
		} else {
			if (callback) callback();
		}
	};

	sequence.fn = sequence.prototype = {
		constructor: sequence,
		init: function(names, callback) {
			this.i = 0;
			this.names = names;
			this.callback = callback;
			this.loadFn();
			return this;
		},
		request: function() {
			this.i += 1;
			if (this.i >= this.names.length) {
				if (this.callback) this.callback();
			} else {
				this.loadFn();
			}
		},
		loadFn: function() {
			var data = fix(this.names[this.i]),
				isJs = /\.js/.test(data.url),
				self = this;
			obj.use(data.url, function() {
				if (data.configCall) data.configCall();
				self.request();
			});
		}
	};

	sequence.fn.init.prototype = sequence.fn;

	String.prototype.capitalize = function() { //转换
		return this.charAt(0).toUpperCase() + this.substr(1);
	};

	var easyjs = function(id, dependencies, factory) {
		if (typeof id == fixUndefined) return;
		define(id, dependencies, factory);
		return this;
	};

	mix(easyjs, {
		ver: "0.0.9.20131212100200001",
		cache: {},
		config: function(ops) {
			if (typeof ops == fixUndefined) return obj.config.data;
			obj.config.call(easyjs, ops);
			return this;
		},
		require: function(id, callback) {
			return obj.require(id, callback);
		},
		use: function(id, dependencies, callback) {
			obj.init(id, dependencies, callback);
			return this;
		},
		on: function(mod, exts) {
			mix.call(easyjs, mod, exts);
			return this;
		},
		off: function(mod) {
			if (mod && easyjs[mod]) delete easyjs[mod];
			return this;
		}
	}, function() {
		return isTouch;
	}, {
		online: global.navigator.onLine || false,
		istouch: isTouch,
		ua: ua,
		orientation: global.orientation ? global.orientation == 0 || global.orientation == 180 ? "horizontal" : "vertical" : false
	});

	each(["js", "css"], function(i, name) {
		mix.call(easyjs, "load" + name.capitalize(), function(url, callback) {
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
		mix((easyjs.config.data = {}), {
			base: getsrc(loadeasyjs) ? (/((.+[\/].+)+?|)\/libs\/(easyjs.+?)\.js/.exec(loadeasyjs.getAttribute("src"))[1] || /((.+[\/].+)+?|)\//.exec(global.location.href)[1]) + "/" : "",
			debug: true,
			frame: "",
			main: "",
			charset: "utf-8",
			alias: {},
			paths: {},
			preload: []
		});
		var config = loadeasyjs.getAttribute("data-config") || false;
		if (config) {
			easyjs.use(config, function() {
				var frame = easyjs.config.data["frame"] || false,
					loads = frame ? [(isParentObject(frame) ? isTouch ? frame.touch || frame.global : frame.global : frame)] : [],
					main = loadeasyjs.getAttribute("data-main") || easyjs.config.data["main"] || false,
					modules = loadeasyjs.getAttribute("data-file") && loadeasyjs.getAttribute("data-file").split(' ') || easyjs.config.data["preload"] || [];
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