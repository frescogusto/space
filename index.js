
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var path = require("path");
var fs = require("fs");
var mkdirp = require('mkdirp');

var Canvas = require("canvas");
var Image = Canvas.Image;

var util = require('util')
var stream = require('stream')
var es = require('event-stream');

var lineNr = 0;
var history;



// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname+'/public'));
app.get('/', function(req,res){
	res.sendFile(__dirname + 'public/index.html');
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
	var t = this;
	fs.readFile(__dirname + '/textures/wall_' + this.number + '.png', function(err, loadedImg){
	  if (err) {
			t.saveImage(__dirname + '/textures');
			// throw err;
			return;
		}
	  img = new Image;
		console.log("READ IMAGE " + ctx);

		img.onload = function(){
				ctx.drawImage(img, 0, 0, img.width, img.height);
				console.log("image loaded");
		};
		img.src = loadedImg;


	});
}

Wall.prototype.saveImage = function(dir){
	// console.log("SAVE IMAGE "+this.ctx);
	var out = fs.createWriteStream( dir + '/wall_' + this.number + '.png');
	var stream = this.canvas.pngStream();

	stream.on('data', function(chunk){
	  out.write(chunk);
	});

	stream.on('err',function(err){
			console.log(err);
	});

	stream.on('end', function(){
	  console.log('saved png');
		out.end();
		// this.readImage(i);
		// this.readImage(this.ctx,this.number);
	});
}

Wall.prototype.draw = function(x,y,brushSize,color){

	x *= this.canvas.width;
	y *= this.canvas.height;
	x = Math.round(x);
	y = Math.round(y);

	this.ctx.fillStyle = color;
	var halfsize = Math.round(brushSize/2);

  this.ctx.fillRect(x-halfsize,y-halfsize,brushSize,brushSize);
  // this.ctx.beginPath();
  // this.ctx.arc(x,y,halfsize,0,2*Math.PI);
  // this.ctx.fill();

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

	// console.log(walls);
	// walls[1].saveImage();

}

createWalls();


setInterval(function(){

	for(var i=0; i<walls.length; i++){
		walls[i].saveImage(__dirname + "/textures");
	}

},  60000);


setInterval(function(){

	 var time = getDate();

	 var newDir =  __dirname + '/backup/textures_' + time;

	 mkdirp(newDir, function (err) {
	    if (err) console.error(err)
	    else{
				console.log("dir " + newDir + " created");
				for(var i=0; i<walls.length; i++){
					walls[i].saveImage(newDir);
				}
			}
		});



}, 60000 * 60 * 12);

function n(n){
    return n > 9 ? "" + n: "0" + n;
}






io.on("connection", function(socket){

	console.log("USER CONNECTED");
	socket.broadcast.emit("user connection", "user connected");

  // CHANGE THIS TO A CLIENT REQUEST
  for(var i=0; i<walls.length; i++){
  	socket.emit("updateWall", i,walls[i].canvas.toDataURL());
  	// console.log("CHISSA");
  }

	socket.on("disconnect", function(){
		console.log("DISCONNECTOOTOTO");
	});

	socket.on("drawHistory", function(frameTime,loops){
		drawHistory(frameTime, loops);
	})

	socket.on("draw", function(wall,x,y,brushSize, color){
		// (x,y,brushSize, color)
		// console.log("someone is drawing at " + x + " " + y + " brush:" + brushSize + " color " + color);
		walls[wall].draw(x,y,brushSize,color);
		socket.broadcast.emit("draw",wall,x,y,brushSize,color);

		writeLog(wall,x,y,brushSize,color);

	});

	// socket.on("typing", function(name){
	// 	console.log(name + " is typing");
	// });

});

function writeLog(wall, x, y, brushSize, color) {
	// var d;
	// d.wall = wall;
	// d.x = x;
	// d.y = y;
	// d.brushSize = brushSize;
	// d.color = color;
	t = new Date().getTime();
	var data = t + " " + wall + " " + x + " " + y + " " + brushSize + " " + color + "\n";
	fs.appendFile('drawLog.txt', data, function (err) {

	});
}

// drawHistory(10);

function drawHistory(frameTime, loops){

	lineNr = 0;
	clearTimeout(history);

	var s = fs.createReadStream('drawLog.txt')
    .pipe(es.split())
    .pipe(es.mapSync(function(line){

        // pause the readstream
        s.pause();

        lineNr += 1;

        // process line here and call s.resume() when rdy
        // function below was for logging memory usage
        // logMemoryUsage(lineNr);

				// console.log(line);

				history = setTimeout(function(){
					console.log(line);
					var asd = line.split(" ");
					// console.log(asd);

					if(asd != ""){
							draw(asd[1], asd[2], asd[3], parseInt(asd[4]), asd[5]);
					}
					// resume the readstream, possibly from a callback
					s.resume();
				},frameTime);


    })
    .on('error', function(){
        console.log('Error while reading file.');
    })
    .on('end', function(){
        console.log('Read entire file.');
				if(loops) drawHistory(frameTime, loops);
    })
  );
}


function draw(wall,x,y,brushSize,color) {
	walls[wall].draw(x,y,brushSize,color);
	io.emit("draw",wall,x,y,brushSize,color);
}


function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getDate() {
	var d = new Date();
	var y = addZero(d.getFullYear());
	var mo = addZero(d.getMonth()+1);
	var day = addZero(d.getDate());
	var h = addZero(d.getHours());
	var m = addZero(d.getMinutes());
	var s = addZero(d.getSeconds());

	var date = y+ '-'+mo+ '-'+day+ '-'+h+ '-'+m+ '-'+s;
	return date;
}
