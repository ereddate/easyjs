easyjs
======

方便快捷的Javascript模块管理框架，这就是我们的目标。


1）引用：

head标签：

<script src="./libs/easyjs.0.0.1.js" id="root" data-config="./config.js" data-main="./app.js"></script>

属性：

src: 框架地址，目录只认libs
id: 只读
data-config: 配置文件地址
data-main: 主文件地址

2）书写：

代码：

define(function(require, exports, module) {
	require("a");
	var b = require("f");
	module.use("http://js.ku6cdn.com/comm/my/libs/jquery.1.9.1.js", function(){
		console.log(jQuery);
	});
	module.use("./plugs/plugs.js", function(){
		console.log("plugs");
	});
	exports.aaa = "a";
});

解释：

require: 引入指定名称的模块，如模块提供返回接口，就会返回结果。
exports: 返回值对象。
module: easyjs主体。

单模块配置及引用方式：

module.config(配置对象);

module.use(引用模块地址, 回调函数);
