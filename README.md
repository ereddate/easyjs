easyjs
======

方便快捷的Javascript模块管理，这就是我们的目标。

<p>声明：此框架与其他名称相近或同名的（包括easyjs.org）无任何关系。</p>

最新版本：0.0.9

官方博客：http://blog.sina.com.cn/u/3868382222

官方微博：http://weibo.com/u/3868382222

目录：
======

1）<a href="https://github.com/ereddate/easyjs#1%E5%BC%95%E7%94%A8">引用</a>

2）<a href="https://github.com/ereddate/easyjs#2%E9%85%8D%E7%BD%AE">配置</a>

3）<a href="https://github.com/ereddate/easyjs#3%E4%B9%A6%E5%86%99">书写</a>

4）<a href="https://github.com/ereddate/easyjs#4%E5%8D%95%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE%E5%8F%8A%E5%BC%95%E7%94%A8%E6%96%B9%E5%BC%8F">单模块配置及引用方式</a>

5）<a href="https://github.com/ereddate/easyjs#5%E5%8F%AF%E6%89%A9%E5%B1%95">可扩展</a>

6）<a href="https://github.com/ereddate/easyjs#6%E5%BC%80%E5%8F%91%E5%8E%86%E5%8F%B2">开发历史</a>

7）<a href="https://github.com/ereddate/easyjs#7%E6%A1%88%E4%BE%8B">案例</a>

8）<a href="https://github.com/ereddate/easyjs#8%E6%9C%AA%E6%9D%A5">未来</a>

1）引用：
======

head标签：

<code>
\<script src="./libs/easyjs.0.0.1.js" id="root" data-config="./config.js" data-main="./app.js" data-file="./demo/easyjs.fn.js ./demo/easyjs.fna.js" \>\</script\></code>

属性：

src: 框架地址，目录只认libs

id: 只读

data-config: 配置文件地址

data-main: 主文件地址

data-file: 预先加载文件地址

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

2）配置：
======

代码：

修改前配置写法 define({ code }); 

修改后配置写法 easyjs.config({ code });

<code>
easyjs.config({

	debug: true,
	
	frame: {
		global: "jquery",  //20131209修改
		touch: "mobile"
	}

	main: "app",

	charset: "utf-8", //20131028增加

	base: "http://www.aaa.com/easyjs/" //20131028增加

	alias: {
		jquery: "bbb/libs/jquery.1.9.1.js",
		mobile: "bbb/libs/jquery.mobile.js",
		app: "./app.js",
		mobile_app: "./mobile/app.js",
		b: "ccc/plugs/plugs.1.0.0.js",
		d: "./plugs/plugs.js",
		e: "aaaaaa/bbb/ccc",
		g: {
			global: "a.js",  //20131209修改
            touch: "b.js"
		},
		f: "./test.js",
		h: "./test1.js"
	},
	
	paths: {
		bbb: "http://a.b.com/comm/",
		ccc: "http://c.b.com/comm/",
		ddd: "http://d.b.com/i/"
	},
	
	preload: ["./demo/easyjs.dom.js", "./demo/easyjs.style.js"]  //20131028增加});
</code>

解释：

debug: 是否处于调试

frame: 开发框架。 global:传统PC设备，touch:移动设备（Phone/Tablet)

main: 开发主文件

charset: 编码

base: 根目录

alias: 别名。 global:传统PC设备，touch:移动设备（Phone/Tablet)

paths: 路径

preload: 预先加载（在开发主文件加载前、开发框架加载后加载）

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

3）书写：
======

代码：

<code>
define({ code });

define(["a","b"], function(){ code });

define("c", ["a","b"], function(){ code });

define(function(require, exports, module) {

	require("a");

	require("a", function(a){
		console.log(a);
	});
	
	var b = require("f");
	
	module.use("http://a.b.com/comm/jquery.1.9.1.js", function(){
	
		console.log(jQuery);
		
	});
	
	module.use("./plugs/plugs.js", function(){
	
		console.log("plugs");
		
	});
	
	exports.aaa = "a";

	return b; });
</code>


解释：

require: 引入指定名称的模块，如模块提供返回接口，就会返回结果。

exports: 返回值对象。

module: easyjs主体。


“移动设备” 提供的属性：

a) online 是否处于在线。

b) istouch 是否是移动设备。

c) ua 系统 navigator.userAgent 信息。

d) orientation 设备方向或不支持。

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

4）单模块配置及引用方式：
======

module.require(模块名,[回调函数]);

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

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

5）可扩展：
======

为什么说我们是框架，因为我们是可扩展的，是要创造一个完整生态系统的。

已删除方法：

module.extend(原对象或扩展方法名, 函数或对象); 


替代方法：

on 绑定自定义方法

module.on(扩展方法名, 函数或对象);

off 取消绑定

module.off(扩展方法名);


代码：

<code>	module.on("jq", jQuery);
	
	module.jq(function(){
	
		module.off("jq");
		
	});
</code>

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

6）开发历史
======

0.0.1-0.0.3 框架定型版

0.0.4 试用版

0.0.5 修复路径识别问题

0.0.6 修复loadJs方法无法重复请求的问题并修改内部逻辑

0.0.7 修复之前版本define嵌套use无法执行等问题并优化内部逻辑，增加预先加载

0.0.8 修复之前只能加载两个依赖项等问题及优化内部逻辑

0.0.9 优化内容逻辑，增加及替换部分接口，增加对移动设备的支持。

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

7）案例
======

酷六网专题 - 是真的吗

http://life.ku6.com/true/index.shtml

使用版本：0.0.6

酷六网专题 - 滔滔不绝

http://ent.ku6.com/ttbjindex/index.shtml

使用版本：0.0.6

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]

8）未来
======

未来 easyjs 将增加插件功能，提供大量的外挂插件。

编写开发规范，指导开发爱好者实现 easyjs 真正的生态系统。

easyjs 提供的插件不再是dom选择器等传统框架提供的功能，而是完整的、解决问题的、实现梦想的插件。

easyjs 等待您的加入。

[<a href="https://github.com/ereddate/easyjs#%E7%9B%AE%E5%BD%95">返回目录</a>] 
[<a href="https://github.com/ereddate/easyjs#easyjs">返回页首</a>]
