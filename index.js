var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var path = require("path");

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req,res){
	res.sendFile(__dirname + "public/index.html");
});
http.listen(4000, function(){
	console.log("listening on 4000");
});

walls = []; // textures of walls
// 0 = front
// 1 = back
// 2 = left
// 3 = right
// 4 = ceiling
// 5 = floor

io.on("connection", function(socket){

	console.log("USER CONNECTO");
	socket.broadcast.emit("user connection", "user conecte");

	// if(msgs.length>0){
	// 	for(var i=0; i<msgs.length; i++){
	// 		socket.emit("chat message", msgs[i].name, msgs[i].msg);
	// 	}
	// }

	socket.on("disconnect", function(){
		console.log("DISCONNECTOOTOTO");
	});

	socket.on("chat message", function(name, msg){
		console.log(msg);
		io.emit("chat message", name, msg);
		addMsg(name,msg);
		// socket.broadcast.emit("chat message", msg);
	});

	// socket.on("typing", function(name){
	// 	console.log(name + " is typing");
	// });

});
