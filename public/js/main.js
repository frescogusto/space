
// var CubemapToEquirectangular = require('three.cubemap-to-equirectangular');

if ( ! Detector.webgl ) {
	Detector.addGetWebGLMessage();
	document.querySelector(".inventory").style.display = "none";
}

var guiOn=false;
var isMobile = false;
var mobileControls;

//////

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.01, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var cubeCamera = new THREE.CubeCamera( 0.1, 1000, 4096 );
var equiUnmanaged = new CubemapToEquirectangular( renderer, true );
// console.log(equiUnmanaged);


var isDown = false;
var firstClick = true;
var cursor = document.querySelector("#cursor");
var cursorLocked = false;

var roomWidth = 8;
var roomHeight = 4;
var roomDepth = 8;

var brushType = 0;
var brushSize = 10;
var drawColor = "black";
var colors = [10];
var currentColorItem = 0;
var inventoryItems = document.querySelectorAll(".inventory .item");

var tool = 0;

var spd = 100.0;
var offset = 0.1;

var walls = [];

// front wall
var plane = new CanvasPlane(roomWidth,roomHeight).plane;
plane.position.set(0,0,-roomDepth/2);
plane.number = 0;
scene.add( plane );
walls.push(plane);
// console.log(plane);
// back wall
var plane = new CanvasPlane(roomWidth,roomHeight).plane;
plane.position.set(0,0,roomDepth/2);
plane.rotation.set(0,Math.PI,0);
plane.number = 1;
scene.add( plane );
walls.push(plane);

// left wall
var plane = new CanvasPlane(roomDepth,roomHeight).plane;
plane.position.set(-roomWidth/2,0,0);
plane.rotation.set(0,Math.PI/2,0);
plane.number = 2;
scene.add( plane );
walls.push(plane);
// right wall
var plane = new CanvasPlane(roomDepth,roomHeight).plane;
plane.position.set(roomWidth/2,0,0);
plane.rotation.set(0,-Math.PI/2,0);
plane.number = 3;
scene.add( plane );
walls.push(plane);

// ceiling
var plane = new CanvasPlane(roomWidth,roomDepth).plane;
plane.position.set(0,roomHeight/2,0);
plane.rotation.set(Math.PI/2,0,0);
plane.number = 4;
scene.add( plane );
walls.push(plane);
// floor
var plane = new CanvasPlane(roomWidth,roomDepth).plane;
plane.position.set(0,-roomHeight/2,0);
plane.rotation.set(-Math.PI/2,0,0);
plane.number = 5;
scene.add( plane );
walls.push(plane);

var geometry = new THREE.PlaneGeometry( 1,1);
var cursorTexture = new THREE.Texture( undefined, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
cursorTexture.magFilter = THREE.NearestFilter;
cursorTexture.minFilter = THREE.NearestFilter;
cursorTexture.generateMipmaps = false;
cursorTexture.canvas = document.createElement( "canvas" );
cursorTexture.canvas.width = cursorTexture.canvas.height = 256;
cursorTexture.context = cursorTexture.canvas.getContext("2d");
cursorTexture.image = cursorTexture.canvas;
cursorTexture.context.fillStyle = "white";
// console.log(cursorTexture);
var cursorMaterial = new THREE.MeshBasicMaterial( { map: cursorTexture, transparent:true } );
cursorMaterial.polygonOffset = true;
cursorMaterial.polygonOffsetFactor = -1; // fix z-fighting
cursorMaterial.polygonOffsetUnits = 0.1;

var cursorPlane = new THREE.Mesh( geometry, cursorMaterial );
scene.add( cursorPlane );

// var sphere = new THREE.Mesh( new THREE.SphereGeometry(0.1,8,8), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
// scene.add(sphere);
// sphere.position.set(0,0,0);
// camera.position.z = 5;


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


///// FPS CONTROLS \\\\\\\
// var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
// var canJump = false;
// var prevTime = performance.now();
// var velocity = new THREE.Vector3();
var controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );
var prevTime = performance.now();
var velocity = new THREE.Vector3();
///////////////////////////


function init(){

	var onKeyDown = function ( event ) {
// console.log(event.keyCode);

		if(event.keyCode >=49 && event.keyCode <= 57) {
			switchColor(event.keyCode-49);
		}
		if(event.keyCode ==48) {
			switchColor(9);
		}

		switch ( event.keyCode ) {

			case 79:
				changeBrushSize(-1);
				break;
			case 80:
				changeBrushSize(1);
				break;

			case 81:
				changeBrushSize(-1);
				break;
			case 69:
				changeBrushSize(1);
				break;

			// case 48:
			// 	saveCubemap();
			// 	break;

			case 75: // K
				setBrushType(0);
				break;
			case 76: // L
				setBrushType(1);
				break;

			case 73:
				setTool(1)
				break;

			case 67:
				// lockPointer();
				toggleGui();
				break;

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				// if ( canJump === true ) velocity.y += 350;
				// canJump = false;
				// this is where the developer updates the scene and creates a cubemap of the scene
				toggleGui();
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	window.addEventListener( 'resize', onWindowResize, false );

	document.getElementById("brushSize").addEventListener("input", function() {
	    // this.textContent = rangeInput.value;
			setBrushSize(this.value);

			// console.log(this);
	}, false);


setColor(0,"000000");
setColor(1,"ffffff");
setColor(2,"ff0000");
setColor(3,"00ff00");
setColor(4,"0000ff");
setColor(5,"ffff00");
setColor(6,"ff00ff");
setColor(7,"00ffff");
setColor(8,"ccc999");
setColor(9,"333333");

controls.getObject().position.set(0,-roomHeight/2 +1,0);
changeBrushSize(0);
setBrushType(1);
changeColor("000000");

jscolor.installByClassName("jscolor");
showGui();


if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
		// setup real compass thing, with event.alpha
		isMobile = true;
		hideGui();
		document.querySelector(".inventory").style.display = "none";
		mobileControls = new THREE.DeviceOrientationControls( camera );
		cursorPlane.visible = false;
} else {
		// setup some mouse following hack
		isMobile = false;
}



// console.log("hash = " + window.location.hash);

// var map = new THREE.TextureLoader().load( "cursor.png" );
// var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false } );
// cursor = new THREE.Sprite( material );
// scene.add( cursor );

}
init();




function updateRaycast(){

	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( walls );

	for ( var i = 0; i < intersects.length; i++ ) {
		// console.log(intersects[i]);
		updateCursorPlane(intersects[i].point, intersects[i].object.rotation);

		if(cursorLocked && isDown){
			num = intersects[i].object.number; // intersected wall number

			var uv = intersects[ i ].uv;
			intersects[i].object.material.map.transformUv( uv );

			if(tool == 0 && !firstClick){
				drawOnWall(num,uv.x,uv.y,brushSize,drawColor,brushType);
				socket.emit("draw",num,uv.x,uv.y,brushSize,drawColor,brushType);
			}
			else if(tool == 1){
					getPixel(num,uv.x,uv.y);
					firstClick = true;
			}
		}

	}

}

function updateCursorPlane(point, rot){
	// cursorPlane.position.set(point.x,point.y,point.z);

	var x = Math.round(point.x*64)/64;
	var y = Math.round(point.y*64)/64;
	var z = Math.round(point.z*64)/64;

	if(brushSize%2 != 0 ){ // align to pixel when width is odd
			// console.log(rot);
			// console.log(point);

			var offset = 1/128; // half pixel
			if(tool == 1) {
				offset = -1/128; // color piker offset
			}

			if(rot._x == 0) {
				if(rot._y == 0) { // parete che vedi all inizio
					y += offset;
					x -= offset;
				}
				else if(rot._y == Math.PI/2) { // left wall
					y += offset;
					z += offset;
				}
				else if(rot._y == Math.PI) { // back wall
					y += offset;
					x += offset;
				}
				else if(rot._y == -Math.PI/2) { // right wall
					y += offset;
					z -= offset;
				}
			}
			else {
				if(rot._x < 0) { // pavement
					x -= offset;
					z -= offset;
				}
				else if(rot._x > 0) { // ceiling
					x -= offset;
					z += offset;
				}
			}

	}

	cursorPlane.position.set(x,y,z);
	cursorPlane.rotation.set(rot.x,rot.y,rot.z);
}

function changeBrushSize(offset){
	var size = brushSize + offset;
	if(size<1)
		size = 1;
	setBrushSize(size);
}

function setBrushSize(size) {

	if(size>256) size = 256;
	brushSize = parseInt(size);
	cursorPlane.scale.set(brushSize/64,brushSize/64,brushSize/64);
	// console.log(cursorPlane.material.map);
	if(brushType == 1) { // if brush is circle
		cursorTexture.repeat.x = 1/(cursorTexture.canvas.width/brushSize);
		cursorTexture.repeat.y = 1/(cursorTexture.canvas.height/brushSize);
		cursorTexture.context.clearRect(0,cursorTexture.canvas.height-brushSize,brushSize,brushSize);
		drawCircle(cursorTexture.context,Math.round(brushSize/2),Math.round(cursorTexture.canvas.height-brushSize/2),brushSize);
	}
	else if (brushType == 0) {
		cursorTexture.context.fillRect(0,cursorTexture.canvas.height-brushSize,brushSize,brushSize);
	}
	cursorTexture.needsUpdate = true;

	document.querySelector(".brushSizeVal").innerHTML = "brush size: " + size;
	document.querySelector("#brushSize").value = size;
	// console.log(brushSize);
}

function setBrushType(type) {
	brushType = type;
	setBrushSize(brushSize);
}

function changeColor(col){
	// console.log(col.toString());
	drawColor = "#"+col;
	cursorMaterial.color = new THREE.Color(parseInt("0x"+col));
	// console.log(cursorMaterial);
	if(document.getElementById("colorpicker").jscolor ){
		document.getElementById('colorpicker').jscolor.fromString(col.toString());
		// console.log(document.getElementById('colorpicker').jscolor);
	}
	setColor(currentColorItem, col.toString());
	// document.getElementById("cursor").style.backgroundColor = col;
}

function drawOnWall(i, x,y,brushSize,color,brushType){
	walls[i].obj.canvas._draw(x,y,brushSize,color,brushType);
}

function getPixel(i, x, y){

	pix = walls[i].obj.canvas.getPixel(x,y);
	col = rgbToHex(pix[0],pix[1],pix[2])
	console.log(col);
	changeColor(col);
	setTool(0);
	// setBrushType(brushType);
	changeBrushSize(0); // resets cursorPlane size

}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}



function onDocumentMouseDown(event){
	isDown = true;
	// firstClick = true;
	// console.log(isDown);
}
function onDocumentMouseUp(event){
	isDown = false;
	firstClick = false;
	// console.log(isDown);
}

// document.addEventListener( 'mousemove', onMouseMove, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mouseup', onDocumentMouseUp, false );




var render = function () {
	requestAnimationFrame( render );

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
	// t += 0.01;
	// plane.rotation.y = Math.sin(t);
	// if(isDown){
	// 	drawAtPoint();
	// }

updateRaycast();


// controls.getObject().position.set(0,0,0);

	if(!isMobile) {
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * spd*0.5 * delta;
		velocity.z -= velocity.z * spd*0.5 * delta;

		if ( moveForward ) velocity.z -= spd * delta;
		if ( moveBackward ) velocity.z += spd * delta;

		if ( moveLeft ) velocity.x -= spd * delta;
		if ( moveRight ) velocity.x += spd * delta;

		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );

		if(controls.getObject().position.x > roomWidth/2 - offset)
			controls.getObject().position.x = roomWidth/2 - offset;
		if(controls.getObject().position.x < -roomWidth/2 + offset)
			controls.getObject().position.x = -roomWidth/2 + offset;
		if(controls.getObject().position.z > roomDepth/2 - offset)
			controls.getObject().position.z = roomDepth/2 - offset;
		if(controls.getObject().position.z < -roomDepth/2 + offset)
			controls.getObject().position.z = -roomDepth/2 + offset;

		if ( controls.getObject().position.y < -roomHeight/2 +1 ) {

			velocity.y = 0;
			controls.getObject().position.y = -roomHeight/2 +1;

		}

		prevTime = time;
	}
	else { // mobile controls
		mobileControls.update();
	}



	renderer.render(scene, camera);
};

render();









function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );

				mouse.x = ( window.innerWidth*0.5 / window.innerWidth ) * 2 - 1;
				mouse.y = - ( window.innerHeight*0.5 / window.innerHeight ) * 2 + 1;
				// document.getElementById("cursor").style.top = window.innerHeight/2;
				// document.getElementById("cursor").style.left = window.innerWidth/2;

			}

renderer.domElement.addEventListener( 'click', function ( event ) {

	// element = document.body;
	// element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	// element.requestPointerLock();
	// controls.enabled = true;
	// gui.style.display = "none";
	// document.getElementById('colorpicker').jscolor.hide();
	// cursorLocked = true;
	hideGui();

});

if ("onpointerlockchange" in document) {
	document.addEventListener('pointerlockchange', lockChangeAlert, false);
} else if ("onmozpointerlockchange" in document) {
	document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
}

function lockChangeAlert() {
	element = document.body;
	if(document.pointerLockElement === element ||
	document.mozPointerLockElement === element) {
		console.log('The pointer lock status is now locked');
		// Do something useful in response
		lockPointer();
	} else {
		console.log('The pointer lock status is now unlocked');
		// Do something useful in response
		unlockPointer();
	}
}

function unlockPointer(){

	if(!cursorLocked) return;
	// console.log('The pointer lock status is now locked. UNLOCKING');
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
	document.exitPointerLock();
	controls.enabled = false;
	// gui.style.display = "flex";

	console.log("unlocked");
	cursorLocked = false;
	showGui();

}

function lockPointer(){

	if(cursorLocked) return;

	element = document.body;
	gui = document.getElementById("gui");

			// console.log('The pointer lock status is now unlocked. LOCKING');
	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	element.requestPointerLock();
	controls.enabled = true;
	// gui.style.display = "none";

	console.log("LOCKED");
	cursorLocked = true;

}

// lockPointer();
function saveCubemap () {

	cursorPlane.visible = false; // hide cursor in 360 image

	cubeCamera.position.copy( camera.position );
	cubeCamera.update( renderer, scene );
	// call this to convert the cubemap rendertarget to a panorama
	equiUnmanaged.convert( cubeCamera );

	cursorPlane.visible = true; // make cursor visible again

}

function toggleGui(){
	guiOn = !guiOn;
	if(guiOn) showGui();
	else hideGui();
}

function showGui() {
	guiOn = true;
	gui = document.getElementById("gui");
	gui.style.display = "flex";
	document.getElementById('colorpicker').jscolor.show();

	unlockPointer();
}
function hideGui() {
	guiOn = false;
	gui = document.getElementById("gui");
	gui.style.display = "none";
	document.getElementById('colorpicker').jscolor.hide();
	lockPointer();
}

function setTool(_tool) {
	tool = _tool;
	if(tool==0) {
		cursor.style.backgroundImage = "none";
	}
	else if(tool==1) {
		cursorPlane.scale.set(1/64,1/64,1/64);
		cursorTexture.repeat.x = 1/(cursorTexture.canvas.width/1);
		cursorTexture.repeat.y = 1/(cursorTexture.canvas.height/1);
		cursorTexture.context.fillRect(0,cursorTexture.canvas.height-1,1,1);
		cursorTexture.needsUpdate = true;
		cursor.style.backgroundImage = "url('img/eyedrop.png')";
	}
}

// INVENTORY COLORS
function switchColor(i) {
	currentColorItem = i;
	document.querySelectorAll(".inventory .selected")[0].classList.remove("selected");
	inventoryItems[i].classList.add("selected");
	changeColor(colors[i]);
}

function setColor(i,col) {
	colors[i] = col;
	inventoryItems[i].style.backgroundColor = "#"+col;
}
