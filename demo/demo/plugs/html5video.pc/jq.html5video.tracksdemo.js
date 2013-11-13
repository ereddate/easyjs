define(function(require, exports, module) {
	exports.exec = {
		cn: [{
			context: "中文字幕1 测试",
			start: 0.000,
			end: 0.500
		}, {
			context: '<a href="#" target="_blank">广告测试</a> 测试字幕内容，也可以是广告.',
			start: 0.600,
			end: 1.000
		}, {
			context: "中文字幕2 测试",
			start: 1.500,
			end: 2.000
		}],
		en: [{
			context: "test1 test",
			start: 0.000,
			end: 0.500
		}, {
			context: '<a href="#" target="_blank">AD test</a> adadfasdfas,asdfasdf.',
			start: 0.600,
			end: 1.000
		}, {
			context: "test2 test",
			start: 1.500,
			end: 2.000
		}],
	};
});