define(function(require, exports, module) {
	//module.use("html5video_pc_css");
	module.use("usetest", function() {
		//console.log("loadjs");
	});
	module.use("testa", function() {
		//console.log("use");
	});
	module.extend("jq", jQuery);
	module.jq(function() {
		console.log("jQuery")
	});

	module.loadJs("http://10.228.132.171:8070/easyjs/demo/plugs/jq.contextmenu/jq.contextmenu.js", function() {
		console.log("jq.contextmenu.js")
	});
	module.loadCss("html5video_pc_css", function() {
		console.log("html5video_pc_css")
		var html5video = require("html5video_pc"),
			texttrack = require('html5video_tracksdemo');
		html5video.exec({
			url: ['http://10.228.132.171:8070/easyjs/demo/video/stronger.mp4'],
			width: "800",
			height: "400",
			loop: true,
			autoplay: true,
			textLanguage: "cn",
			textTracks: texttrack.exec,
			params: {
				quality: "high",
				allowScriptAccess: "always",
				wMode: "opaque",
				swLiveConnect: "true",
				allowFullScreen: "true",
				bgColor: "#000000",
				flashVars: "adss=0&amp;auto=1&amp;logo=#&amp;api=1"
			},
			flashCallback: function(video, ops) {

			}
		});
	});

});