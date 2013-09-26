easyjs
======

方便快捷的Javascript模块管理框架，这就是我们的目标。


1）引用：

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

<code>
define({

	debug: true,
	
	alias: {
		a: "bbb/libs/jquery.1.9.1.js",
		b: "ccc/plugs/plugs.1.0.0.js",
		d: "./plugs/plugs.js",
		e: "aaaaaa/bbb/ccc",
		c: {
			url: "ddd/unreadmessagecount",
			callback: function(data) {
				alert("jsonp");
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

alias: 别名

paths: 路径

3）书写：

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


单模块配置及引用方式：

module.config(配置对象);

module.use(引用模块地址, 回调函数);
