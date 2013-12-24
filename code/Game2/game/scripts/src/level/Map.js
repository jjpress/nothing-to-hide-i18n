(function(exports){
	
	var Map = function(level,config){
	
		var self = this;

		// Properties
		this.level = level;
		this.config = config;

		// Graphics
		this.background = config.background;
		this.cam = config.cam;
		this.goal = config.goal;
		this.propaganda = config.propaganda || [];

		// Dimensions
		var tiles = config.map;
		var width = tiles[0].length;
		var height = tiles.length;
		this.tiles = tiles;
		this.width = width*Map.TILE_SIZE;
		this.height = height*Map.TILE_SIZE;

		// MY CANVASSES
		
		this.camCanvas = document.createElement("canvas");
		this.camCanvas.width = Math.min(self.width, Display.width);
		this.camCanvas.height = Math.min(self.height, Display.height);
		this.camContext = this.camCanvas.getContext('2d');

		// Collision Hittest
		this.getTile = function(px,py){
			var x = Math.floor(px/Map.TILE_SIZE);
			var y = Math.floor(py/Map.TILE_SIZE);
			if(x<0||x>=width) return Map.WALL;
			if(y<0||y>=height) return Map.WALL;
			return tiles[y][x];	
		};
		this.hitTest = function(px,py){
			var tile = this.getTile(px,py);
			return(tile==Map.WALL || tile==Map.SCREEN || tile==Map.SCREEN_LINE || tile==Map.PROP);
		}

		///////////////////
		///// DRAWING /////
		///////////////////

		// Create background cache canvasses
		var bgCache = document.createElement("canvas");
		bgCache.width = self.width;
		bgCache.height = self.height;
		var bgContext = bgCache.getContext('2d');

		var camCache = document.createElement("canvas");
		camCache.width = self.width;
		camCache.height = self.height;
		var camContext = camCache.getContext('2d');

		var lineCache = document.createElement("canvas");
		lineCache.width = self.width;
		lineCache.height = self.height;
		var lineContext = lineCache.getContext('2d');		

		self.bgCache = bgCache;
		self.camCache = camCache;
		self.lineCache = lineCache;

		// Drawing placeholders
		if(this.cam){
			camContext.drawImage(this.cam,0,0);
		}else{
			_makePlaceholderCCTV(self,camContext,tiles,config);
		}
		if(this.background){
			bgContext.drawImage(this.background,0,0);
		}else{
			_makePlaceholderBG(self,bgContext,tiles,config);
		}
		_makePlaceholderLine(self,lineContext,tiles,config);

		// Draw Loop
		this.draw = function(ctx){
			
			// Positions
			var w = Math.min(self.width,Display.width);
			var h = Math.min(self.height,Display.height);
			var x = (w==Display.width) ? -level.camera.cx : 0;
			var y = (h==Display.height) ? -level.camera.cy : 0;

			// To prevent out of bounds
			if(x<0){
				w += x;
				x = 0;
			}
			if(x+w>bgCache.width){
				w = bgCache.width-x-1;
			}
			if(y<0){
				h += y;
				y = 0;
			}
			if(y+h>bgCache.height){
				h = bgCache.height-y-1;
			}

			// Draw background
			ctx.drawImage( bgCache, x,y,w,h, x,y,w,h );

			// Draw Propaganda
			for(var i=0;i<self.propaganda.length;i++){

				var lie = self.propaganda[i];
				switch(lie.type){
					case "image":
						var lieImage = Asset.image[lie.img]; // ????
						ctx.drawImage(lieImage, lie.x*Map.TILE_SIZE, lie.y*Map.TILE_SIZE);
						break;
				}

			}

			// Draw screen lines.
			ctx.fillStyle=textures.screenline;
			for(var i=0;i<screenlines.length;i++){
				var screenline = screenlines[i];
				var x = screenline.x;
				var y = screenline.y;
				ctx.fillRect(x*Map.TILE_SIZE,y*Map.TILE_SIZE,Map.TILE_SIZE,Map.TILE_SIZE);
			}

		};

		// Get Screen Lines, once.
		var screenlines = [];
		for(var y=0;y<tiles.length;y++){
			for(var x=0;x<tiles[y].length;x++){
				if(tiles[y][x]==Map.SCREEN_LINE){
					screenlines.push({ x:x, y:y });
				}
			}
		}


		///////////////////
		///// HELPERS /////
		///////////////////

		// Debug: Get a quick placeholder image
		this._getBackgroundImage = function(){
			return bgCache.toDataURL();
		};
		this._getCCTVImage = function(){
			return camCache.toDataURL();
		};

		// TEXTURES
		textures = {};
		var _createTextureFromImage = function(imageName){
			var patternTexture = Asset.image[imageName];
			var pattern = Display.context.tmp.createPattern(patternTexture, 'repeat');
			textures[imageName] = pattern;
			return pattern;
		}
		_createTextureFromImage("carpet");
		_createTextureFromImage("carpet_cctv");
		_createTextureFromImage("screenline");

	};
	var textures;

	// CONSTANTS
	Map.WALL = "#";
	Map.SCREEN = "=";
	Map.SCREEN_LINE = "+";
	Map.SPACE = " ";
	Map.METAL = "M";
	Map.PROP = "@";
	Map.CARPET = ".";
	Map.TILE_SIZE = 50;


	// PLACEHOLDER BACKGROUNDS
	var _makePlaceholderBG = function(self,ctx,tiles,config){
		for(var y=0;y<tiles.length;y++){
			for(var x=0;x<tiles[y].length;x++){
				switch(tiles[y][x]){
					
					case Map.SPACE: ctx.fillStyle="#D7E7E6"; break;
					case Map.CARPET: ctx.fillStyle=textures.carpet; break;
					case Map.WALL: ctx.fillStyle="#000"; break;
					case Map.SCREEN: ctx.fillStyle="#363B43"; break;
					case Map.SCREEN_LINE: ctx.fillStyle="#363B43"; break;
					case Map.PROP: ctx.fillStyle="#7F6A5F"; break;
					
					// Placeholder
					case Map.METAL: ctx.fillStyle="#9900FF"; break;

				}
				ctx.fillRect(x*Map.TILE_SIZE,y*Map.TILE_SIZE,Map.TILE_SIZE,Map.TILE_SIZE);
			}
		}
	};
	
	var _makePlaceholderCCTV = function(self,ctx,tiles,config){
		for(var y=0;y<tiles.length;y++){
			for(var x=0;x<tiles[y].length;x++){
				switch(tiles[y][x]){

					case Map.SPACE: ctx.fillStyle="#555"; break;
					case Map.CARPET: ctx.fillStyle=textures.carpet_cctv; break;
					case Map.WALL: ctx.fillStyle="#000"; break;
					case Map.SCREEN: ctx.fillStyle="#222"; break;
					case Map.SCREEN_LINE: ctx.fillStyle="#222"; break;
					case Map.PROP: ctx.fillStyle="#666666"; break;

					// Placeholder
					case Map.METAL: ctx.fillStyle="#9900FF"; break;

				}
				ctx.fillRect(x*Map.TILE_SIZE,y*Map.TILE_SIZE,Map.TILE_SIZE,Map.TILE_SIZE);
			}
		}

		// DRAW GOAL
		var gx = (self.goal.ax + self.goal.bx)/2 - 0.5;
		var gy = (self.goal.ay + self.goal.by)/2 - 0.5;
		ctx.drawImage(Asset.image.exit, gx*Map.TILE_SIZE, gy*Map.TILE_SIZE);

	};

	var _makePlaceholderLine = function(self,ctx,tiles,config){

		// The border of game
		ctx.fillStyle="#fff";
		ctx.fillRect(0,0,self.width,1);
		ctx.fillRect(0,0,1,self.height);
		ctx.fillRect(0,self.height-1,self.width,1);
		ctx.fillRect(self.width-1,0,1,self.height);

		// Outline
		for(var y=0;y<tiles.length;y++){
			for(var x=0;x<tiles[y].length;x++){
				var tile = tiles[y][x];
				if(tile==Map.WALL || tile==Map.SCREEN || tile==Map.SCREEN_LINE){
					ctx.fillRect(
						x*Map.TILE_SIZE-1,
						y*Map.TILE_SIZE-1,
						Map.TILE_SIZE+2,
						Map.TILE_SIZE+2
					);
				}
			}
		}

		// Fill
		for(var y=0;y<tiles.length;y++){
			for(var x=0;x<tiles[y].length;x++){
				var tile = tiles[y][x];
				if(tile==Map.WALL || tile==Map.SCREEN || tile==Map.SCREEN_LINE){
					ctx.fillStyle="#000";
					ctx.fillRect(x*Map.TILE_SIZE,y*Map.TILE_SIZE,Map.TILE_SIZE,Map.TILE_SIZE);
				}
			}
		}

		// DRAW GOAL
		var gx = (self.goal.ax + self.goal.bx)/2 - 0.5;
		var gy = (self.goal.ay + self.goal.by)/2 - 0.5;
		ctx.drawImage(Asset.image.exit, gx*Map.TILE_SIZE, gy*Map.TILE_SIZE);

	};

	exports.Map = Map;

})(window);