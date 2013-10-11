easyjs
======

方便快捷的Javascript模块管理，这就是我们的目标。

最新版本：0.0.5

目录：
======

1）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#1%E5%BC%95%E7%94%A8">引用</a>

2）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#2%E9%85%8D%E7%BD%AE">配置</a>

3）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#3%E4%B9%A6%E5%86%99">书写</a>

4）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#4%E5%8D%95%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE%E5%8F%8A%E5%BC%95%E7%94%A8%E6%96%B9%E5%BC%8F">单模块配置及引用方式</a>

5）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#5%E5%8F%AF%E6%89%A9%E5%B1%95">可扩展</a>

6）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#6%E5%BC%80%E5%8F%91%E5%8E%86%E5%8F%B2">开发历史</a>

7）<a href="https://github.com/ereddate/easyjs/blob/master/README.md#7%E6%A1%88%E4%BE%8B">案例</a>


1）引用：
======

head标签：

<code>
\<script src="./libs/easyjs.0.0.1.js" id="root" data-config="./config.js" data-main="./app.js"\>\</script\>
</code>

属性：

src: 框架地址，目录只认libs

id: 只读

data-config: 配置文件地址

data-main: 主文件地址

2）配置：
======

代码：

<code>
define({

	debug: true,
	
	frame: "jquery",  //20130927增加
	
	main: "app",  //20130927增加
	
	alias: {
		jquery: "bbb/libs/jquery.1.9.1.js",
		main: "./app.js",
		b: "ccc/plugs/plugs.1.0.0.js",
		d: "./plugs/plugs.js",
		e: "aaaaaa/bbb/ccc",
		c: {
			url: "ddd/unreadmessagecount",
			type: "jsonp",  //20130927增加
			callback: function(data) {
				alert(data);
			}
		},
		g: {
			url: "./plugs/plugs.js",
			callback: function() {
				console.log("plug_ok");
			}
		},
		f: "./test.js",
		h: "./test1.js"
	},
	
	paths: {
		bbb: "http://a.b.com/comm/",
		ccc: "http://c.b.com/comm/",
		ddd: "http://d.b.com/i/"
	}});
</code>

解释：

debug: 是否处于调试

frame: 开发框架

main: 开发主文件

alias: 别名

paths: 路径

3）书写：
======

代码：

<code>
define(function(require, exports, module) {

	require("a");
	
	var b = require("f");
	
	module.use("http://a.b.com/comm/jquery.1.9.1.js", function(){
	
		console.log(jQuery);
		
	});
	
	module.use("./plugs/plugs.js", function(){
	
		console.log("plugs");
		
	});
	
	exports.aaa = "a";});
</code>


解释：

require: 引入指定名称的模块，如模块提供返回接口，就会返回结果。

exports: 返回值对象。

module: easyjs主体。


4）单模块配置及引用方式：
======

module.config(配置对象);

module.use(引用模块地址, 回调函数);

module.loadJs(文件地址, 回调函数);

module.loadCss(文件地址, 回调函数);


代码：

<code>	module.use("./plugs/plugs.js", function(){
	
		console.log("plugs_use");
		
	});
	
	module.loadCss("./css/index.css", function(){
	
		module.jq("#aaa").addClass("a").show();
		
	});
</code>


5）可扩展：
======

为什么说我们是框架，因为我们是可扩展的，是要创造一个完整生态系统的。

module.extend(原对象或扩展方法名, 函数或对象);

module.implement(原对象或扩展方法名, 函数或对象);

代码：

<code>	module.extend("jq", jQuery);
	
	module.jq(function(){
	
		alert("hello");
		
	});
</code>

6）开发历史
======

0.0.1-0.0.3 框架定型版

0.0.4 试用版

0.0.5 修复路径识别问题

7）案例
======

酷六网专题 - 是真的吗

http://life.ku6.com/true/index.shtml

使用版本：0.0.4


