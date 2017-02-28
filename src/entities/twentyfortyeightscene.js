var NumberTile = require('./numbertile');
var Tile = require('./tile');

function coordAt(x) {
	return 70 * (x - 1.5);
}
function rint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = tarmac.Scene.extend({
	timeOfLastAdjust: 0,
	construct: function() {
		this._super(tarmac.viewportPresets.iPhone);

		this.createBoard();
		this.createDebugUI();
		this.createGrid();

		this.addRandomTile();
		this.addRandomTile();

		var _this = this;
		InputEmitter.on('ARROW', function(direction){
			_this.pushTiles(direction);
		});
	},
	createBoard: function() {
		for(var y = 0; y < 4; y++) {
			for(var x = 0; x < 4; x++) {
				this.addEntity(new Tile({
					x: coordAt(x),
					y: coordAt(y),
					fill: '#334'
				}));
			}
		}
	},
	createDebugUI: function() {
 		this.fps = new tarmac.shapes.Text({y:180});
 		this.addEntity(this.fps);
	},
	createGrid: function() {
		this.grid = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
	},
	addTileAt: function(x, y) {
		var tile = new NumberTile({
			x: coordAt(x),
			y: coordAt(y)
		});
		this.grid[x][y] = tile;
 		this.addEntity(tile);
	},
	addRandomTile: function() {
		var options = [];
		for(var y = 0; y < 4; y++) {
			for(var x = 0; x < 4; x++) {
				if(this.grid[x][y] === 0) {
					options.push({x:x,y:y});
				}
			}
		}
		var pos = options[rint(0, options.length - 1)];
		if(pos) {
			this.addTileAt(pos.x, pos.y);
		}
		//TODO: check for game-over
	},
	pushTiles: function(direction) {
		var didsomething = false;
		if(direction === 'left') {
			for(var y = 0; y < 4; y++) {
				for(var x = 0; x < 4; x++) {

					if(this.grid[x][y]) {
						var tile = this.grid[x][y];
						for(var x2 = x - 1; x2 >= 0; x2--) {
							if(!this.grid[x2][y]) {
								this.grid[x2][y] = tile;
								this.grid[x2 + 1][y] = 0;
								tile.seekx = coordAt(x2);
								didsomething = true;
							} else if(this.grid[x2][y].number === tile.number) {
								this.grid[x2][y].double();
								this.grid[x2 + 1][y] = 0;
								tile.seekx = coordAt(x2);
								tile.flagForDeletion();
								didsomething = true;
								break;
							} else {
								break;
							}
						}
					}
				}
			}
		} else if(direction === 'right') {
			for(var y = 0; y < 4; y++) {
				for(var x = 3; x >= 0; x--) {

					if(this.grid[x][y]) {
						var tile = this.grid[x][y];
						for(var x2 = x + 1; x2 < 4; x2++) {
							if(!this.grid[x2][y]) {
								this.grid[x2][y] = tile;
								this.grid[x2 - 1][y] = 0;
								tile.seekx = coordAt(x2);
								didsomething = true;
							} else if(this.grid[x2][y].number === tile.number) {
								this.grid[x2][y].double();
								this.grid[x2 - 1][y] = 0;
								tile.seekx = coordAt(x2);
								tile.flagForDeletion();
								didsomething = true;
								break;
							} else {
								break;
							}
						}
					}
				}
			}
		} else if(direction === 'up') {
			for(var x = 0; x < 4; x++) {
				for(var y = 0; y < 4; y++) {

					if(this.grid[x][y]) {
						var tile = this.grid[x][y];
						for(var y2 = y - 1; y2 >= 0; y2--) {
							if(!this.grid[x][y2]) {
								this.grid[x][y2] = tile;
								this.grid[x][y2 + 1] = 0;
								tile.seeky = coordAt(y2);
								didsomething = true;
							} else if(this.grid[x][y2].number === tile.number) {
								this.grid[x][y2].double();
								this.grid[x][y2 + 1] = 0;
								tile.seeky = coordAt(y2);
								tile.flagForDeletion();
								didsomething = true;
								break;
							} else {
								break;
							}
						}
					}
				}
			}
		} else if(direction === 'down') {
			for(var x = 0; x < 4; x++) {
				for(var y = 3; y >= 0; y--) {
					if(this.grid[x][y]) {
						var tile = this.grid[x][y];
						for(var y2 = y + 1; y2 < 4; y2++) {
							if(!this.grid[x][y2]) {
								this.grid[x][y2] = tile;
								this.grid[x][y2 - 1] = 0;
								tile.seeky = coordAt(y2);
								didsomething = true;
							} else if(this.grid[x][y2].number === tile.number) {
								this.grid[x][y2].double();
								this.grid[x][y2 - 1] = 0;
								tile.seeky = coordAt(y2);
								tile.flagForDeletion();
								didsomething = true;
								break;
							} else {
								break;
							}
						}
					}
				}
			}
		}

		if(didsomething) {
			this.addRandomTile();
		}
	},
	adjust: function(t) {
		if(this.timeOfLastAdjust) {
			var timeElapsed = t - this.timeOfLastAdjust;
			var fps = Math.round(1000/timeElapsed);
			this.fps.value = 'fps:' + fps;
		}
		this.timeOfLastAdjust = t;
	}
});

//swipe -> lockdown -> calc future positions -> transition -> delete/recalc totals -> unlock