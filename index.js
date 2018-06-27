
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var path = require("path");
var fs = require("fs");
var mkdirp = require('mkdirp');

// const redisAdapter = require('socket.io-redis');
// io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
// console.log(io.adapter());

var Canvas = require("canvas");
var Image = Canvas.Image;

var util = require('util')
var stream = require('stream')
var es = require('event-stream');

// var shortid = require('shortid');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/space';
var db;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, _db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
	db = _db.db("space");

	// db.createCollection("rooms", function(err, res) {
  //   if (err) throw err;
  //   console.log("Collection created!");
  //   // _db.close();
  // });

  // _db.close();
});


var lineNr = 0;
var history;

var brushes = [];
for (let i = 0; i < 200; i++) {
  fs.readFile(__dirname + '/brushes/' + (i+1) + '.png', function(err, loadedImg) {
    if (err) throw err; // Fail if the file can't be read.
    let img = new Image;
		img.onload = function(){
  			brushes[i] = img
		};
		img.src = loadedImg;
  });

}

// ROOM
// id - url
// password
//

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname+'/public'));
app.use('/room',  express.static(__dirname + '/public'));
// app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req,res){
	res.sendFile(__dirname + 'public/index.html');
});

app.get('/new' , function(req,res){
	// var id = shortid.generate();
	// res.redirect('/'+id);
	// console.log(req.url);
	// res.sendFile(__dirname + '/public/index.html');
});

app.get('/rooms' , function(req,res){
	// db.collection("rooms").find().toArray(function(err,data){
	// 	res.send(data);
	// })
	var data = '<ul>';
	db.collection("rooms").find().sort({ $natural:-1 }).forEach(function(item){
		// console.log(item);
		if(item.walls != undefined && item.walls[0] != undefined)
		data += `<li style="float:left"><a href="./room/${item.name}">${item.name}
		<div style="border: 1px solid black; margin:10px;">
		<img width="100" src="${item.walls[0]}"/><img width="100" src="${item.walls[3]}"/><img width="100" src="${item.walls[1]}"/><img width="100" src="${item.walls[2]}"/>
		</div>
		</a>
		</li>`;
	}, function(err) {
  // done or error
		data += '</ul>';
		res.set('Content-Type', 'text/html');
		res.send(data);
	});
});

app.get('/room/*' , function(req,res){

	var room = req.url.slice(6);
	room = room.toLowerCase();

	console.log(room);
	console.log("HEEEIIIIIII------------------");
	doRoomExist(room, function(exists){
		console.log(exists);
		if(exists){
			console.log("CIAO!!! LA STANZA EISTE");
			res.sendFile(__dirname + '/public/index.html' );
		} else {
			console.log("NON ESISTE STA STANZA! 666666 EMOJI");
			res.sendFile(__dirname + '/public/404.html' );
		}
	})
	console.log("HEEEIIIIIII--------------");



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

rooms = [];


Wall = function(w,h,i,dataUrl){ // WALL CLASS

	w = w*64;
	h = h*64;
	this.canvas = new Canvas(w,h);
	this.ctx = this.canvas.getContext("2d");
	this.number = i;
	// console.log("START " +this.ctx);
	// this.saveImage();
	// this.readImage(this.ctx,this.number);
	this.loadImage(this.ctx, dataUrl);
}

Wall.prototype.createWall = function(w,h){

}

Wall.prototype.loadImage = function(ctx, dataUrl) {
	img = new Image;
	img.onload = function(){
			ctx.drawImage(img, 0, 0, img.width, img.height);
			// console.log("WALL LOADED");
	};
	// console.log(dataUrl);
	img.src = dataUrl;
}

Wall.prototype.draw = function(x,y,brushSize,color,brushType){

	x *= this.canvas.width;
	y *= this.canvas.height;
	x = Math.round(x);
	y = Math.round(y);

	this.ctx.fillStyle = color;
	var halfsize = Math.round(brushSize/2);

  if(brushSize<1) brushSize =1;
  else if(brushSize>200) brushSize = 200;

  // this.ctx.fillRect(x-halfsize,y-halfsize,brushSize,brushSize);
	if(brushType == 0) {
		this.ctx.fillRect(x-halfsize,y-halfsize,brushSize,brushSize); // SQUARE BRUSH
	}
	else if(brushType==1) {
		// drawCircle(this.ctx, x,y,brushSize);
    // drawCircleEasy(this.ctx, x,y,brushSize);
    drawCircleBrush(this.ctx,x,y,brushSize,brushes[brushSize-1],color)
	}

}

function createWalls(wallsDataUrls){

	var _walls = [];

	var roomWidth = 8;
	var roomHeight = 4;
	var roomDepth = 8;

	// console.log(wallsDataUrls);

  // createWall(roomWidth,roomHeight,0,wallsDataUrls[0])

	var wall = new Wall(roomWidth,roomHeight,0,wallsDataUrls[0]);
	_walls.push(wall);
	var wall = new Wall(roomWidth,roomHeight,1,wallsDataUrls[1]);
	_walls.push(wall);

	var wall = new Wall(roomDepth,roomHeight,2,wallsDataUrls[2]);
	_walls.push(wall);
	var wall = new Wall(roomDepth,roomHeight,3,wallsDataUrls[3]);
	_walls.push(wall);

	var wall = new Wall(roomWidth,roomDepth,4,wallsDataUrls[4]);
	_walls.push(wall);
	var wall = new Wall(roomWidth,roomDepth,5,wallsDataUrls[5]);
	_walls.push(wall);

	// console.log("CIAOOOOO");
	// console.log(_walls);
	// walls[1].saveImage();
	return _walls;

}


function openRoom(room) {
	room.walls = createWalls(room.walls);
	console.log("__ROOM OPENED: " + room.name );
	rooms.push(room);
}

function closeRoom(name) {
	var validRoom = rooms.find( _room => _room.name === name )
	saveRoom(validRoom);
	var index = rooms.indexOf(validRoom);
	if (index > -1) {
    rooms.splice(index, 1);
	}
	console.log(name + " ___CLOSED");
}

function saveRoom(room) {
	// room.walls =
	if(room.isClean) return;

	// for (var i = 0; i < room.walls.length; i++) {
	// 	room.walls[i] = room.walls[i].canvas.toDataURL();
	// }
  var wallsSaved = 0;
  for(let i=0; i<room.walls.length; i++){
    room.walls[i].canvas.toDataURL(function(err, png){
      if(err) throw(err);
      room.walls[i] = png;
      wallsSaved ++;
      if(wallsSaved >= room.walls.length) {
        db.collection("rooms").save(room, function(err, res) {
          if (err) throw err;
          console.log("ROOM SAVED " + res);
        });
      }
    });
	}

}

function createRoom(_name) {
	var room = {
		// _id:makeRoomName(_name),
		name: makeRoomName(_name),
		walls : [],
		users: 0,
		isPrivate: false,
		password: "",
		isClean: true
	}

	openRoom(room);

	console.log("CREATED " +room.name);
	console.log(room);
}

function makeRoomName(roomName) {
	var newName = roomName.replace(/[^a-z0-9]/gi,'');
	newName = newName.toLowerCase().substring(0, 32);
	return newName;
}


// setInterval(function(){
//
// 	for(var i=0; i<walls.length; i++){
// 		walls[i].saveImage(__dirname + "/textures");
// 	}
//
// },  60000);
//
//
// setInterval(function(){
//
// 	 var time = getDate();
//
// 	 var newDir =  __dirname + '/backup/textures_' + time;
//
// 	 mkdirp(newDir, function (err) {
// 	    if (err) console.error(err)
// 	    else{
// 				console.log("dir " + newDir + " created");
// 				for(var i=0; i<walls.length; i++){
// 					walls[i].saveImage(newDir);
// 				}
// 			}
// 		});
//
//
//
// }, 60000 * 60 * 12);
//
// function n(n){
//     return n > 9 ? "" + n: "0" + n;
// }




io.on("connection", function(socket){

	// console.log(socket.id + " CONNECTED");
	// console.log(socket.request.headers);

	socket.emit("connected");

  // CHANGE THIS TO A CLIENT REQUEST
	socket.on("joinRoom", function(room){
		if(typeof(room) !== "string") {
			console.log("not a string");
			return;
		}

		var validRoom = rooms.find( _room => _room.name === room )
		if(validRoom) { // if room is open
			connectToRoom(socket, validRoom);
			socket.broadcast.to(room).emit("user connection", "user connected: " + socket.id);
		}
		else {
			db.collection('rooms').find({name:room}).toArray(function(err, items){
				// console.log(items[0]);
				if(items.length>0) {
					var room = items[0];
					openRoom(room);
					connectToRoom(socket, room);
				}
			});
		}


	});

	socket.on("createRoom", function(name) {
		if(typeof(name) !== "string") {
			console.log("not a string");
			return;
		}

		name = makeRoomName(name);
		var existsInDb = false;
		var dbRoom;
		db.collection('rooms').find({ name:name }).toArray(function(err, items){
			if(items.length>0) {
				existsInDb = true;
				dbRoom = items[0];
			}
			// console.log(items);

			if(!rooms.some( _room => _room.name === name ) && !existsInDb ){ // if room is not open and is not in db (it doesnt exists)
				console.log("00000______ROOM DOESNT EXIST___________00000");
				createRoom(name);
				socket.emit("joinRoom", name); // tell the client to go to new url
			}
			else if(rooms.some( _room => _room.name === name )){
				console.log("XXXXX______ROOM EXIST AND IS OPEN");
				var validRoom = rooms.find( _room => _room.name === name )
				connectToRoom(socket, validRoom);
				socket.emit("joinRoom", name); // tell the client to go to new url
			}
			else if (existsInDb) {
				console.log("XXXXX______ROOM EXIST IN DATABASE");
				openRoom(dbRoom);
				connectToRoom(socket, dbRoom);
				socket.emit("joinRoom", name); // tell the client to go to new url
			}

		});
		console.log("_________creating ROOM");


	})

	socket.on("disconnect", function(){
		console.log(socket.id + " disconnected");
	})

	socket.on("disconnecting", function(){
		// console.log(socket.id + " disconnected");
		// console.log(socket.room);
		if(socket.room) {

			var roomConnections = socket.adapter.rooms[socket.room.name].length;
			console.log(roomConnections);
			console.log("_____" + socket.id + " DISCONNECTING FROM " + socket.room.name);
			if(roomConnections <= 1 ){
					closeRoom(socket.room.name);
			}
		}
	})

	socket.on("drawHistory", function(frameTime,loops){
		drawHistory(frameTime, loops);
	})

	socket.on("draw", function(wall,x,y,brushSize, color,brushType){
		// (x,y,brushSize, color)
		// console.log("someone is drawing at " + x + " " + y + " brush:" + brushSize + " color " + color);
		// console.log(brushType);
		if(socket.room && socket.room.walls[wall]!=undefined) {
			socket.room.walls[wall].draw(x,y,brushSize,color,brushType);
			socket.broadcast.to(socket.room.name).emit("draw",wall,x,y,brushSize,color,brushType);
			// socket.room.isClean = false;
			// writeLog(wall,x,y,brushSize,color,brushType);
		}

	});

});

function connectToRoom(socket, room) {
	var alreadyConnected = false;
	for(_room in socket.rooms){
		if(room.name == _room) {
			alreadyConnected = true;
			break;
		}
		if(socket.id !== _room) socket.leave(_room);
	}
	if(alreadyConnected) return;

	socket.join(room.name, function(){
		socket.room = room;
		console.log(socket.id + " CONNECTED TO " + socket.room.name);
	});

	for(let i=0; i<room.walls.length; i++){
		// socket.emit("updateWall", i, room.walls[i].canvas.toDataURL());
    room.walls[i].canvas.toDataURL(function(err, png){
      if(err) throw(err);
      socket.emit("updateWall", i, png);
    });
	}
}

function getAllRoomMembers(room, _nsp) {
    var roomMembers = [];
    var nsp = (typeof _nsp !== 'string') ? '/' : _nsp;

// io.sockets.in(socket.room.name).sockets;
    for( var member in io.nsps[nsp].adapter.rooms[room] ) {
        roomMembers.push(member);
    }

    return roomMembers;
}

function writeLog(wall, x, y, brushSize, color,brushType) {
	// var d;
	// d.wall = wall;
	// d.x = x;
	// d.y = y;
	// d.brushSize = brushSize;
	// d.color = color;
	t = new Date().getTime();
	var data = t + " " + wall + " " + x + " " + y + " " + brushSize + " " + color + " " + brushType + "\n";
	fs.appendFile('drawLog.txt', data, function (err) {

	});
}

function doRoomExist(name, callback) {
	db.collection('rooms').find({ name:name }).toArray(function(err, items){
		var existsInDb;
		var dbRoom;
		if(items.length>0) {
			existsInDb = true;
			dbRoom = items[0];
		}
		var validRoom = rooms.find( _room => _room.name === name );
		callback(existsInDb || validRoom!=null)
	})
}

function isRoomOpen(roomName) {

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



function drawCircle(context, cx, cy, d) {
		if(d%2 == 1) {
			cx-=1;
			cy-=1;
		}
		if(d==3){
			drawPixel(context,cx,cy);
			drawPixel(context,cx+1,cy);
			drawPixel(context,cx,cy+1);
			drawPixel(context,cx-1,cy);
			drawPixel(context,cx,cy-1);
			return;
		}
	var x,y;
	var r = Math.floor(d/2);
		for (var i = -r; i<=r; i++) {
				for (var j = -r; j<=r; j++) {
					x = i;
					y = j;
					if(d%2 == 0) {
						if(i>0) {
							x=i+1;
						}
						if(j>0) {
							y=j+1;
						}
					}
					if (  Math.round(Math.sqrt(x*x + y*y)) <= r){
							drawPixel(context,i + cx, j + cy)
					}
				}
		}
}

function drawPixel(context,x,y) {
	context.fillRect(x,y,1,1);
}

function drawCircleBrush(context,cx,cy,d,_img,color) {
  // var d = r*2
  canvas = new Canvas(d,d);
  ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'destination-atop';
  ctx.drawImage(_img, 0, 0);

  canvas.toDataURL(function(err, png){
    img = new Image(d,d);
    img.onload = function(){
      context.drawImage(img,cx-Math.round(d/2),cy-Math.round(d/2) );
      delete ctx;
      delete canvas;
      delete img;
    }
    img.src = png;
  });

}
