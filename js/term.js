(function () {
	var glob = window;

	glob.InlineTerminal = function (cont, base_url, config) {
		cont = $(cont);
		var dom = cont[0];
		var config = $.extend({}, config);

		var socket, term;

		// function resize(cols, rows) {
		// 	cont.width(cols * cwidth);
		// 	cont.height(rows * cheight);
		// 	term.resize(cols, rows);
		// }

		function init() {
			cont.children().remove();

			// alert([ cont.width(), cols, rows, cwidth ]);

			var cols = 67;
			var rows = 20;

			term = new Terminal({
				cursorBlink: true,
				scrollback: 1024,
				tabStopWidth: 4,

				cols: cols,
				rows: rows
			});

			term.on("resize", function (size) {
				if (!pid) return;

				var cols = size.cols,
					rows = size.rows,
					url = "http://" + base_url + "/term/" + pid + "/size?cols=" + cols + "&rows=" + rows;

				fetch(url, { method: "POST" });
			});

			var proto = (location.protocol === "https:") ? "wss://" : "ws://";
			var url = proto + base_url + "/term";

			var pid;

			term.open(dom, true);

			fetch("http://" + base_url + "/term?cols=" + cols + "&rows=" + rows, { method: "POST" }).then(function (res) {
				res.text().then(function (npid) {
					pid = npid;
					url += "/" + pid;
					socket = new WebSocket(url);
					socket.onopen = run;
				});

				cont.find(".xterm-rows").ready(function () {
					// alert(term.charMeasure.width);
					var cwidth = cont.find(".xterm-rows").width() / cols;
					var cheight = cont.find(".xterm-rows").height() / rows;

					cont.width(cols * cwidth);
					cont.height(rows * cheight);

					// cols = Math.floor(cont.width() / cwidth - 5);
					// rows = Math.floor(cont.height() / cheight - 5);

					// console.log([ cols, rows ]);

					// term.resize(54, 19);
					// // term.charMeasure.measure();
				});
			});
		}

		function run() {
			term.attach(socket);
			term._initialized = true;
		}

		cont.ready(function () {
			init();

			if (config.onFocus) {
				$(term.textarea).focus(config.onFocus);
			}

			if (config.onBlur) {
				$(term.textarea).blur(config.onBlur);
			}
		});

		var ret = {};

		return ret;
	};
})();
