var fs = require("fs");
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var path = require("path");

var Canvas = require("canvas");
var Image = Canvas.Image;



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



Wall = function(w,h,i){ // WALL CLASS

	w = w*64;
	h = h*64;
	this.canvas = new Canvas(w,h);
	this.ctx = this.canvas.getContext("2d");
	this.number = i;
	console.log("START " +this.ctx);
	// this.saveImage();
	this.readImage(this.ctx,this.number);
}

Wall.prototype.createWall = function(w,h){

}

Wall.prototype.readImage = function(ctx){
	fs.readFile(__dirname + '/textures/wall_' + this.number + '.png', function(err, squid){
	  if (err) throw err;
	  img = new Image;
	  img.src = squid;
		console.log("READ IMAGE " +ctx);
	  ctx.drawImage(img, 0, 0, img.width, img.height);

	});
}

Wall.prototype.saveImage = function(){
	console.log("SAVE IMAGE "+this.ctx);
	var out = fs.createWriteStream(__dirname + '/textures/wall_' + this.number + '.png');
	var stream = this.canvas.pngStream();

	stream.on('data', function(chunk){
	  out.write(chunk);
	});

	stream.on('end', function(){
	  console.log('saved png');
		// this.readImage(i);
		// this.readImage(this.ctx,this.number);
	});
}



function createWalls(){

	var roomWidth = 8;
	var roomHeight = 4;
	var roomDepth = 8;

	var wall = new Wall(roomWidth,roomHeight,0);
	walls.push(wall);
	var wall = new Wall(roomWidth,roomHeight,1);
	walls.push(wall);

	var wall = new Wall(roomDepth,roomHeight,2);
	walls.push(wall);
	var wall = new Wall(roomDepth,roomHeight,3);
	walls.push(wall);

	var wall = new Wall(roomWidth,roomDepth,4);
	walls.push(wall);
	var wall = new Wall(roomWidth,roomDepth,5);
	walls.push(wall);

	for(var i=0; i<6; i++){
			// walls[i].readImage(wall.ctx,i);
	}
	// console.log(walls);
	// walls[1].saveImage();

}

createWalls();



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
