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
				this._background.addEventListener( "load", function ( event ) {

					that._canvas.width = that._background.naturalWidth;
					that._canvas.height = that._background.naturalHeight;

					that._crossRadius = Math.ceil( Math.min( that._canvas.width, that._canvas.height / 30 ) );
					that._crossMax = Math.ceil( 0.70710678 * that._crossRadius );
					that._crossMin = Math.ceil( that._crossMax / 10 );
					that._crossThickness = Math.ceil( that._crossMax / 10 );

					that._draw();

				}, false );
				this._background.crossOrigin = '';

				this._context2D.fillStyle = "#ffffff";
				this._context2D.fillRect(0,0,this._canvas.width,this._canvas.height);

				for(var i=0; i<this._canvas.width; i++){
					for(var j=0; j<this._canvas.height; j++){
						ran = Math.round(Math.random()*200)+55 + j;
						// ran = Math.round(Math.random()*150)+105 ;
						// ran = j*Math.sin(i);
						this._context2D.fillStyle = "rgba("+ran+","+ran+","+ran+",255)";
						this._context2D.fillRect( i, j, 1, 1 );
					}
				}
				// this._background.src = "textures/UV_Grid_Sm.jpg";

				this._draw();

			}


CanvasTexture.prototype = {

	constructor: CanvasTexture,

	_canvas: null,
	_context2D: null,
	_xCross: 0,
	_yCross: 0,

	_crossRadius: 57,
	_crossMax: 40,
	_crossMin: 4,
	_crossThickness: 4,

	_parentTexture: [],

	addParent: function ( parentTexture ) {

		if ( this._parentTexture.indexOf( parentTexture ) === - 1 ) {

			this._parentTexture.push( parentTexture );
			parentTexture.image = this._canvas;

		}

	},

	setCrossPosition: function ( x, y, brushSize ) {

		this._xCross = x * this._canvas.width;
		this._yCross = y * this._canvas.height;

		this._draw();

	},

	_draw: function (x,y,brushSize, color) {

		if ( ! this._context2D ) return;

		// this._context2D.fillStyle = "#cccfff";
		// this._context2D.clearRect( 0, 0, this._canvas.width, this._canvas.height )

		// Background.
		// this._context2D.drawImage( this._background, 0, 0 );

		// Yellow cross.
		// this._context2D.lineWidth = this._crossThickness * 3;
		// this._context2D.strokeStyle = "#0000ff";
		//
		// this._context2D.beginPath();
		// this._context2D.moveTo( this._xCross - this._crossMax - 2, this._yCross - this._crossMax - 2 );
		// this._context2D.lineTo( this._xCross - this._crossMin, this._yCross - this._crossMin );
		//
		// this._context2D.moveTo( this._xCross + this._crossMin, this._yCross + this._crossMin );
		// this._context2D.lineTo( this._xCross + this._crossMax + 2, this._yCross + this._crossMax + 2 );
		//
		// this._context2D.moveTo( this._xCross - this._crossMax - 2, this._yCross + this._crossMax + 2 );
		// this._context2D.lineTo( this._xCross - this._crossMin, this._yCross + this._crossMin );
		//
		// this._context2D.moveTo( this._xCross + this._crossMin, this._yCross - this._crossMin );
		// this._context2D.lineTo( this._xCross + this._crossMax + 2, this._yCross - this._crossMax - 2 );
		//
		// this._context2D.stroke();
		x *= this._canvas.width;
		y *= this._canvas.height;
		x = Math.round(x);
		y = Math.round(y);

		this._context2D.fillStyle = "#000000";
		this._context2D.fillStyle = color;
		size = brushSize;
		halfsize = Math.round(size/2)
		this._context2D.fillRect(x-halfsize,y-halfsize,size,size);

		for ( var i = 0; i < this._parentTexture.length; i ++ ) {

			this._parentTexture[ i ].needsUpdate = true;

		}

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
