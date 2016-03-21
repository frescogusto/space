
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.01, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var isDown = false;
// var cursor;
var cursorLocked = false;

var roomWidth = 8;
var roomHeight = 4;
var roomDepth = 8;

var brushSize = 10;
var drawColor = "black";

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

// console.log(walls[0]);
// plane = new CanvasPlane(4,2).plane;
// plane.position.set(-2,0,2);
// plane.rotation.set(0,Math.PI/2,0);
// scene.add( plane );
//
// plane = new CanvasPlane(4,2).plane;
// plane.position.set(2,0,2);
// plane.rotation.set(0,-Math.PI/2,0);
// scene.add( plane );
//
// plane = new CanvasPlane(4,4).plane;
// plane.position.set(0,-1,2);
// plane.rotation.set(-Math.PI/2,0,0);
// scene.add( plane );
//
// plane = new CanvasPlane(4,4).plane;
// plane.position.set(0,1,2);
// plane.rotation.set(Math.PI/2,0,0);
// scene.add( plane );

var geometry = new THREE.PlaneGeometry( 1,1);
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
material.polygonOffset = true;
material.depthTest = true;
material.polygonOffsetFactor = -1; // fix z-fighting
material.polygonOffsetUnits = 0.1;
var cursorPlane = new THREE.Mesh( geometry, material );
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
console.log(event.keyCode);
						switch ( event.keyCode ) {

							case 79:
								changeBrushSize(-1);
								break;
							case 80:
								changeBrushSize(1);
								break;
							case 49:
								changeColor("white");
								break;
							case 50:
								changeColor("black");
								break;
							case 51:
								changeColor("red");
								break;
							case 52:
								changeColor("rgb(0,255,0)");
								break;
							case 53:
								changeColor("rgb(0,0,255)");
								break;
							case 54:
								changeColor("rgb(255,255,0)");
								break;
							case 55:
								changeColor("rgb(0,255,255)");
								break;

							case 73:
								cursorPlane.scale.set(1/64,1/64,1/64);
								tool = 1;
								break;

							case 67:
								lockPointer();
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
								if ( canJump === true ) velocity.y += 350;
								canJump = false;
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

controls.getObject().position.set(0,-roomHeight/2 +1,0);
changeBrushSize(0);
changeColor("000000");

// var map = new THREE.TextureLoader().load( "cursor.png" );
// var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false } );
// cursor = new THREE.Sprite( material );
// scene.add( cursor );

}
init();



// function drawAtPoint(event){
// 	// calculate mouse position in normalized device coordinates
// 	// (-1 to +1) for both components
// 	// mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
// 	// mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
// 	mouse.x = ( window.innerWidth*0.5 / window.innerWidth ) * 2 - 1;
// 	mouse.y = - ( window.innerHeight*0.5 / window.innerHeight ) * 2 + 1;
//
// 	// update the picking ray with the camera and mouse position
// 	raycaster.setFromCamera( mouse, camera );
// 	// calculate objects intersecting the picking ray
// 	var intersects = raycaster.intersectObjects( walls );
//
// 	for ( var i = 0; i < intersects.length; i++ ) {
// 		var uv = intersects[ i ].uv;
// 		// console.log(intersects[ i ].object);
// 		intersects[i].object.material.map.transformUv( uv );
// 		// intersects[ i ].object.obj.canvas.setCrossPosition( uv.x, uv.y, brushSize);
// 		// intersects[ i ].object.obj.canvas._draw( uv.x, uv.y, brushSize, drawColor);
// 		num = intersects[i].object.number; // intersected wall number
//
// 		console.log(intersects[i]);
// 		// face.normal
// 		updateCursorPlane(intersects[i].point, intersects[i].object.rotation);
//
// 		if(cursorLocked){
// 			drawOnWall(num,uv.x,uv.y,brushSize,drawColor);
// 			socket.emit("draw",num,uv.x,uv.y,brushSize,drawColor);
// 		}
//
// 		// sphere.position.set(intersects[ i ].point.x,intersects[ i ].point.y,intersects[ i ].point.z);
//
// 	}
// }


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

			if(tool == 0){
				drawOnWall(num,uv.x,uv.y,brushSize,drawColor);
				socket.emit("draw",num,uv.x,uv.y,brushSize,drawColor);
			}
			else if(tool == 1){
					getPixel(num,uv.x,uv.y);
			}


		}
	}

}

function updateCursorPlane(point, rot){
	// cursorPlane.position.set(point.x,point.y,point.z);
	// if(brushSize%2 != 0){
	// 	// console.log("DISPA");
	// 	cursorPlane.position.set(Math.round(point.x*64)/64-0.5/64,Math.round(point.y*64)/64,Math.round(point.z*64)/64-0.5/64);
	// }
	// else

	cursorPlane.position.set(Math.round(point.x*64)/64,Math.round(point.y*64)/64,Math.round(point.z*64)/64);
	cursorPlane.rotation.set(rot.x,rot.y,rot.z);
}

function changeBrushSize(offset){
	brushSize += offset;
	if(brushSize<1)
	brushSize = 1;

	cursorPlane.scale.set(brushSize/64,brushSize/64,brushSize/64);
}


function changeColor(col){
	drawColor = "#"+col;
	cursorPlane.material.color = new THREE.Color(parseInt("0x"+col));
	// console.log(color);
	// document.getElementById("cursor").style.backgroundColor = col;
}

function drawOnWall(i, x,y,brushSize,color){
	walls[i].obj.canvas._draw(x,y,brushSize,color);
}

function getPixel(i, x, y){

	pix = walls[i].obj.canvas.getPixel(x,y);
	col = rgbToHex(pix[0],pix[1],pix[2])
	console.log(col);
	changeColor(col);
	tool = 0;
	changeBrushSize(0); // resets cursorPlane size
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
		if(r<10) r = "0"+r;
		if(g<10) g = "0"+g;
		if(b<10) b = "0"+b;
    return ((r << 16) | (g << 8) | b).toString(16);
}



function onDocumentMouseDown(event){
	isDown = true;
}
function onDocumentMouseUp(event){
	isDown = false;
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

	var time = performance.now();
						var delta = ( time - prevTime ) / 1000;

						velocity.x -= velocity.x * spd*0.5 * delta;
						velocity.z -= velocity.z * spd*0.5 * delta;

						// velocity.y -= 9.8 * 1.0 * delta; // 100.0 = mass

						if ( moveForward ) velocity.z -= spd * delta;
						if ( moveBackward ) velocity.z += spd * delta;

						if ( moveLeft ) velocity.x -= spd * delta;
						if ( moveRight ) velocity.x += spd * delta;

						// if ( isOnObject === true ) {
						// 	velocity.y = Math.max( 0, velocity.y );
						//
						// 	canJump = true;
						// }

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

						// camera.position.y = -10;

						prevTime = time;


						// cursor.position.set(window.innerWidth/2,window.innerHeight/2,0);

					// controls.getObject().position.set(0,0,0);
// sphere.position.set(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z);

	// camera.rotation.x = pitchObject.x;
	// camera.rotation.y = yawObject.y;

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



	//
	// var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	// if ( havePointerLock ) {
	//
	// 	var element = document.body;
	// 	var pointerlockchange = function ( event ) {
	// 		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
	// 			// controlsEnabled = true;
	// 			controls.enabled = true;
	// 			//
	// 			// blocker.style.display = 'none';
	// 		} else {
	// 			controls.enabled = false;
	// 			//
	// 			// blocker.style.display = '-webkit-box';
	// 			// blocker.style.display = '-moz-box';
	// 			// blocker.style.display = 'box';
	// 			//
	// 			// instructions.style.display = '';
	// 		}
	// 	};
	// 	var pointerlockerror = function ( event ) {
	// 		// instructions.style.display = '';
	// 	};
	//
	// 	// Hook pointer lock state change events
	// 	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	// 	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	// 	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
	//
	// 	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	// 	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	// 	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
	//
	// 	document.addEventListener( 'click', function ( event ) {
	//
	// 		// instructions.style.display = 'none';
	//
	// 		// Ask the browser to lock the pointer
	// 		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	//
	// 		// if ( /Firefox/i.test( navigator.userAgent ) ) {
	// 		//
	// 		// 	var fullscreenchange = function ( event ) {
	// 		//
	// 		// 		if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
	// 		//
	// 		// 			document.removeEventListener( 'fullscreenchange', fullscreenchange );
	// 		// 			document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
	// 		//
	// 		// 			element.requestPointerLock();
	// 		// 		}
	// 		//
	// 		// 	};
	// 		//
	// 		// 	document.addEventListener( 'fullscreenchange', fullscreenchange, false );
	// 		// 	document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
	// 		//
	// 		// 	element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
	// 		//
	// 		// 	element.requestFullscreen();
	// 		//
	// 		// } else {
	// 		//
	// 		// 	element.requestPointerLock();
	// 		//
	// 		// }
	//
	// 		element.requestPointerLock();
	//
	// 	}, false );
	//
	// } else {
	//
	// console.log("Your browser doesn\'t seem to support Pointer Lock API");
	// 	// instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	//
	// }
document.addEventListener( 'click', function ( event ) {
	// lockPointer();
	element = document.body;
	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	element.requestPointerLock();
	controls.enabled = true;
	gui.style.display = "none";
	document.getElementById('colorpicker').jscolor.hide();
	cursorLocked = true;
});

function lockPointer(){
			console.log("pointer lock");
			element = document.body;
			gui = document.getElementById("gui");
			if(document.pointerLockElement === element ||
				document.mozPointerLockElement === element) {
					console.log('The pointer lock status is now locked. UNLOCKING');
					document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
					document.exitPointerLock();
					controls.enabled = false;
					gui.style.display = "block";
					document.getElementById('colorpicker').jscolor.show();

					console.log("unlocked");
					cursorLocked = false;

			} else {
					console.log('The pointer lock status is now unlocked. LOCKING');
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
					element.requestPointerLock();
					controls.enabled = true;
					gui.style.display = "none";
					document.getElementById('colorpicker').jscolor.hide();

					console.log("now is locked");
					cursorLocked = true;

			}
}

// lockPointer();
