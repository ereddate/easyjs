define({
        debug: false,
        frame: "jquery",
        main: "app",
        charset: "utf-8",
        base: "http://10.228.132.171:8070/easyjs/",
        alias: {
                jquery: "jquery/jquery.1.10.2.js",
                app: "./demo/app.js",
                usetest: "./demo/test.js",
                test: "10.228.132.171:8070/easyjs/demo/exports.js",
                testa: "./demo/exports.js",
                testb: "./demo/testb.js",
                testc: "./demo/testc.js",
                jqcookie: "./demo/plugs/jq.cookie/jq.cookie.js",
                jqcontextmenu: "./demo/plugs/jq.contextmenu/jq.contextmenu.js",
                jqlocalstorage: "./demo/plugs/jq.localstorage/jq.localstorage.js",
                html5video_pc: "./demo/plugs/html5video.pc/jq.html5video.js",
                html5video_tracksdemo: "./demo/plugs/html5video.pc/jq.html5video.tracksdemo.js",
                html5video_pc_css: "./demo/plugs/html5video.pc/jq.html5video.css"
        },
        paths: {
                demo: "demo",
                module: "demo",
                jquery: "demo"
        },
        preload: ["http://10.228.132.171:8070/easyjs/demo/easyjs.dom.js", "module/easyjs.style.js"]
});