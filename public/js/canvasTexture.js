CanvasTexture = function ( parentTexture, w, h) {

				this._canvas = document.createElement( "canvas" );
				ratio = w/h;
				this._canvas.width = 64 * w;
				this._canvas.height = 64 * h;
				this._context2D = this._canvas.getContext( "2d" );

				if ( parentTexture ) {

					this._parentTexture.push( parentTexture );
					parentTexture.image = this._canvas;

				}

				var that = this;
				this._background = document.createElement( "img" );
				this._background.crossOrigin = '';

				this._context2D.fillStyle = "#ffffff";
				this._context2D.fillRect(0,0,this._canvas.width,this._canvas.height);

				this._draw();

			}


CanvasTexture.prototype = {

	constructor: CanvasTexture,

	_canvas: null,
	_context2D: null,
	_parentTexture: [],

	addParent: function ( parentTexture ) {

		if ( this._parentTexture.indexOf( parentTexture ) === - 1 ) {

			this._parentTexture.push( parentTexture );
			parentTexture.image = this._canvas;

		}

	},

	_draw: function (x,y,brushSize, color,brushType) {

		if ( ! this._context2D ) return;

		x *= this._canvas.width;
		y *= this._canvas.height;
		x = Math.round(x);
		y = Math.round(y);

		this._context2D.fillStyle = "#000000";
		this._context2D.fillStyle = color;
		size = brushSize;
		halfsize = Math.round(size/2);

		// for(var i=0; i< brushSize; i++){ // SPRAY BRUSH
		// 	for(var j=0; j< brushSize; j++){
		// 		if(Math.random() < 0.2)
		// 		this._context2D.fillRect(x-halfsize+i,y-halfsize+j,1,1);
		// 	}
		// }

		if(brushType == 0) {
				this._context2D.fillRect(x-halfsize,y-halfsize,size,size); // SQUARE BRUSH
		}
		else if(brushType==1) {
			drawCircle(this._context2D, x,y,size);
		}




		this.updateTexture();

	},

	updateTexture: function(){
		for ( var i = 0; i < this._parentTexture.length; i ++ ) {

			this._parentTexture[ i ].needsUpdate = true;

		}
	},

	loadImage: function(_canvas){
		var img = new Image;
		var thisTex = this;
		img.onload = function(){ // wait for img to load after setting src -> http://stackoverflow.com/questions/4776670/should-setting-an-image-src-to-data-url-be-available-immediately
			// console.log(thisTex);
			thisTex._context2D.drawImage( img, 0, 0 );
			thisTex.updateTexture();
		}
		// this.updateTexture();

		img.src = _canvas;

	},

	getPixel: function(x,y){

		x *= this._canvas.width;
		y *= this._canvas.height;
		x = Math.round(x);
		y = Math.round(y);
		var c = this._context2D.getImageData(x,y,1,1).data;
		// console.log(c);
		return c;

	}

}


CanvasPlane = function(_width, _height){

	this.geometry = new THREE.PlaneGeometry( _width, _height, 1 );
	this.texture = new THREE.Texture( undefined, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
	this.texture.magFilter = THREE.NearestFilter;
	this.texture.minFilter = THREE.NearestFilter;
	this.texture.generateMipmaps = false;

	this.canvas = new CanvasTexture( this.texture, _width, _height );
	this.material = new THREE.MeshBasicMaterial( { map: this.texture } );

	this.plane = new THREE.Mesh( this.geometry, this.material );
	this.plane.obj = this; // make mesh reference its CanvasPlane object

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
		for (let i = -r; i<=r; i+=1) {
				for (let j = -r; j<=r; j+=1) {

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
