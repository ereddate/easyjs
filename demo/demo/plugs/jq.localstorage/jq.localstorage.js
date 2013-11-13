define(function(require, exports, module) {
    var win = window,
        doc = win.document,
        body = doc.body,
        _toString = Object.prototype.toString,
        fixUndefined = typeof undefined,
        isArray = function(v) {
            return typeof v !== fixUndefined ? (v.constructor == Array) ? true : false : false;
        },
        isFunction = function(v) {
            return typeof v != fixUndefined ? typeof v === "function" && typeof v.call != fixUndefined && _toString.call(v) === '[object Function]' : false;
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
                if (obj && (typeof obj == "string" || obj.nodeType || obj == win || obj == doc)) {
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
        };
    exports.cache = {
        hname: location.hostname ? location.hostname : 'localStorage_easyjs',
        isLocalStorage: win.localStorage ? true : false,
        dataDom: false,
        initDom: function() {
            if (!this.dataDom) {
                try {
                    this.dataDom = doc.createElement('input');
                    var dm = this.dataDom;
                    dm.type = 'hidden';
                    dm.style.display = "none";
                    dm.addBehavior('#default#userData');
                    body.appendChild(dm);
                } catch (ex) {
                    return false;
                }
            }
            return true;
        },
        set: function(key, value) {
            if (isFunction(key)) {
                return this.set(key.call(), value);
            }
            if (isFunction(value)) {
                return this.set(key, value.call());
            }
            if (this.isLocalStorage) {
                var key = typeof key == "string" ? key.split(' ') : key,
                    value = typeof value == "string" ? value.split(' ') : value;
                var m = win.localStorage,
                    i, len;
                for (i = 0; i < (len = key.length); i++) {
                    m.setItem(isArray(key) ? "easyjs_" + key[i] : "easyjs_" + key, isArray(value) ? value[i] : value);
                }
                key = value = m = null;
            } else {
                if (this.initDom()) {
                    this.dataDom.load(this.hname);
                    var key = typeof key == "string" ? key.split(' ') : key,
                        value = typeof value == "string" ? value.split(' ') : value;
                    var m = this.dataDom,
                        i, len;
                    for (i = 0; i < (len = key.length); i++) {
                        m.setAttribute(isArray(key) ? "easyjs_" + key[i] : "easyjs_" + key, isArray(value) ? value[i] : value);
                    }
                    this.dataDom.save(this.hname);
                    body.removeChild(this.dataDom);
                    key = value = m = null;
                }
            }
            return this;
        },
        get: function(key) {
            if (isFunction(key)) {
                return this.get(key.call());
            }
            if (this.isLocalStorage) {
                var rvalue = null,
                    key = typeof key == "string" ? key.split(' ') : key;
                if (key) {
                    var key = typeof key == "string" ? key.split(' ') : key;
                    if (isArray(key)) {
                        rvalue = [];
                        each(key, function() {
                            rvalue.push(win.localStorage.getItem("easyjs_" + this));
                        });
                    } else {
                        rvalue = win.localStorage.getItem("easyjs_" + key);
                    }
                }
                key = null;
                return rvalue;
            } else {
                if (this.initDom()) {
                    this.dataDom.load(this.hname);
                    var rvalue = null;
                    if (key) {
                        var key = typeof key == "string" ? key.split(' ') : key;
                        if (isArray(key)) {
                            rvalue = [];
                            var m = this.dataDom;
                            each(key, function() {
                                rvalue.push(m.getAttribute("easyjs_" + this));
                            });
                        } else {
                            rvalue = this.dataDom.getAttribute("easyjs_" + key);
                        }
                    }
                    body.removeChild(this.dataDom);
                    key = m = null;
                    return rvalue;
                }
            }
        },
        remove: function(key) {
            if (isFunction(key)) {
                return this.remove(key.call());
            }
            if (this.isLocalStorage) {
                if (key) {
                    var key = typeof key == "string" ? key.split(' ') : key;
                    if (isArray(key)) {
                        each(key, function() {
                            win.localStorage.removeItem("easyjs_" + this);
                        });
                    } else {
                        win.localStorage.removeItem("easyjs_" + key);
                    }
                    key = null;
                }
            } else {
                if (this.initDom()) {
                    this.dataDom.load(this.hname);
                    if (key) {
                        var key = typeof key == "string" ? key.split(' ') : key;
                        if (isArray(key)) {
                            var m = this.dataDom;
                            each(key, function() {
                                m.removeAttribute("easyjs_" + this);
                            });
                        } else {
                            this.dataDom.removeAttribute("easyjs_" + key);
                        }
                        this.dataDom.save(this.hname);
                        key = m = null;
                    }
                    body.removeChild(this.dataDom);
                }
            }
            return this;
        },
        key: function(index) {
            if (this.isLocalStorage) {
                try {
                    return win.localStorage.key(index);
                } catch (e) {
                    return "error!";
                }
            } else {
                if (this.initDom()) {
                    this.dataDom.load(this.hname);
                    var ddArray = [];
                    each(this.dataDom.attributes, function() {
                        if (this.nodeName.indexOf("easyjs_") > -1) {
                            ddArray.push(this);
                        }
                    });
                    return ddArray[index];
                } else {
                    return "";
                }
            }
        },
        length: function() {
            if (this.isLocalStorage) {
                return win.localStorage.length;
            } else {
                if (this.initDom()) {
                    this.dataDom.load(this.hname);
                    var len = 0;
                    each(this.dataDom.attributes, function() {
                        if (this.nodeName.indexOf("easyjs_") > -1) {
                            len += 1;
                        }
                    });
                    return len;
                } else {
                    return 0;
                }
            }
        },
        clear: function() {
            if (this.isLocalStorage) {
                win.localStorage.clear();
            } else {
                if (this.initDom()) {
                    this.dataDom.load(this.hname);
                    each(this.dataDom.attributes, function() {
                        if (this.nodeName.indexOf("easyjs_") > -1) {
                            this.dataDom.removeAttribute(this);
                        }
                    });
                    this.dataDom.save(this.hname);
                    body.removeChild(this.dataDom);
                }
            }
            return this;
        }
    };
});