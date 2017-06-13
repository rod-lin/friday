var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
var os = require("os");
var pty = require("node-pty");

var terminals = {}, logs = {};

app.use("/js", express.static("js"));
app.use("/css", express.static("css"));
app.use("/xterm.js", express.static("xterm.js"));
app.use("/font", express.static("font"));
app.use("/img", express.static("img"));

app.use("/main.html", express.static("main.html"));
app.use("/test.html", express.static("test.html"));

app.post("/term", function (req, res) {
	var cols = parseInt(req.query.cols),
		rows = parseInt(req.query.rows),
		term = pty.spawn(process.platform === "win32" ? "cmd.exe" : "bash", [], {
			name: "xterm-color",
			cols: cols || 80,
			rows: rows || 24,
			cwd: process.env.PWD,
			env: process.env
		});

	console.log("created terminal with PID: " + term.pid);
	terminals[term.pid] = term;
	logs[term.pid] = "";
	term.on("data", function(data) {
		logs[term.pid] += data;
	});
	res.send(term.pid.toString());
	res.end();
});

app.post("/term/:pid/size", function (req, res) {
	var pid = parseInt(req.params.pid),
		cols = parseInt(req.query.cols),
		rows = parseInt(req.query.rows),
		term = terminals[pid];

	term.resize(cols, rows);
	console.log("resized terminal " + pid + " to " + cols + " cols and " + rows + " rows");
	res.end();
});

app.ws("/term/:pid", function (ws, req) {
	var term = terminals[parseInt(req.params.pid)];

	console.log("connected to terminal " + term.pid);
	ws.send(logs[term.pid]);

	term.on("data", function(data) {
		try {
			ws.send(data);
		} catch (ex) {
			// The WebSocket is not open, ignore
		}
	});
	
	ws.on("message", function(msg) {
		term.write(msg);
	});

	ws.on("close", function () {
		term.kill();
		console.log("Closed terminal " + term.pid);
		// Clean things up
		delete terminals[term.pid];
		delete logs[term.pid];
	});
});

var port = 3140, host = "localhost";

console.log("listening to http://" + host + ":" + port);
app.listen(port, host);
