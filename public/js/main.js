
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.01, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var isDown = false;
// var cursor;

var roomWidth = 8;
var roomHeight = 4;
var roomDepth = 8;

var brushSize = 4;
var drawColor = "black";

var spd = 100.0;
var offset = 0.1;

// front wall
var plane = new CanvasPlane(roomWidth,roomHeight).plane;
plane.position.set(0,0,-roomDepth/2);
scene.add( plane );
// back wall
var plane = new CanvasPlane(roomWidth,roomHeight).plane;
plane.position.set(0,0,roomDepth/2);
plane.rotation.set(0,Math.PI,0);
scene.add( plane );

// left wall
var plane = new CanvasPlane(roomDepth,roomHeight).plane;
plane.position.set(-roomWidth/2,0,0);
plane.rotation.set(0,Math.PI/2,0);
scene.add( plane );
// right wall
var plane = new CanvasPlane(roomDepth,roomHeight).plane;
plane.position.set(roomWidth/2,0,0);
plane.rotation.set(0,-Math.PI/2,0);
scene.add( plane );

// ceiling
var plane = new CanvasPlane(roomWidth,roomDepth).plane;
plane.position.set(0,roomHeight/2,0);
plane.rotation.set(Math.PI/2,0,0);
scene.add( plane );
// floor
var plane = new CanvasPlane(roomWidth,roomDepth).plane;
plane.position.set(0,-roomHeight/2,0);
plane.rotation.set(-Math.PI/2,0,0);
scene.add( plane );

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

var sphere = new THREE.Mesh( new THREE.SphereGeometry(0.1,8,8), new THREE.MeshBasicMaterial( { color: 0xff0000 } ));
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
								brushSize -= 1;
								if(brushSize < 1)
									brushSize = 1;
								break;
							case 80:
								brushSize += 1;
								break;
							case 49:
								drawColor = "red";
								break;
							case 50:
								drawColor = "white";
								break;
							case 51:
								drawColor = "black";
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


// var map = new THREE.TextureLoader().load( "cursor.png" );
// var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false } );
// cursor = new THREE.Sprite( material );
// scene.add( cursor );

}
init();



function drawAtPoint(event){
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	// mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	// mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	mouse.x = ( window.innerWidth*0.5 / window.innerWidth ) * 2 - 1;
	mouse.y = - ( window.innerHeight*0.5 / window.innerHeight ) * 2 + 1;

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );
	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );

	for ( var i = 0; i < intersects.length; i++ ) {
		var uv = intersects[ i ].uv;
		// console.log(intersects[ i ].object);
		intersects[ i ].object.material.map.transformUv( uv );
		// intersects[ i ].object.obj.canvas.setCrossPosition( uv.x, uv.y, brushSize);
		intersects[ i ].object.obj.canvas._draw( uv.x, uv.y, brushSize, drawColor);

		// sphere.position.set(intersects[ i ].point.x,intersects[ i ].point.y,intersects[ i ].point.z);

	}
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
	if(isDown){
		drawAtPoint();
	}
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

							canJump = true;

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
				// document.getElementById("cursor").style.top = window.innerHeight/2;
				// document.getElementById("cursor").style.left = window.innerWidth/2;

			}



var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {

	var element = document.body;
	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			// controlsEnabled = true;
			controls.enabled = true;
			//
			// blocker.style.display = 'none';
		} else {
			controls.enabled = false;
			//
			// blocker.style.display = '-webkit-box';
			// blocker.style.display = '-moz-box';
			// blocker.style.display = 'box';
			//
			// instructions.style.display = '';
		}
	};
	var pointerlockerror = function ( event ) {
		// instructions.style.display = '';
	};

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	document.addEventListener( 'click', function ( event ) {

		// instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {

			var fullscreenchange = function ( event ) {

				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}

			};

			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();

		} else {

			element.requestPointerLock();

		}

	}, false );

} else {

console.log("Your browser doesn\'t seem to support Pointer Lock API");
	// instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}
