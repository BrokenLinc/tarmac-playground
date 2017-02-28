var GameState = require('./hexgamestate');
var HexTile = require('./hextile');
var Arrow = require('./arrow');

module.exports = tarmac.Scene.extend({
	armies: ['red', 'blue'],
	construct: function() {
		this._super(tarmac.viewportPresets.widescreen);


		this.buildBoard();
		this.placeArmies();

		this.currentTurnLabel = new tarmac.shapes.Text({
			x: -90,
			y: -190,
			size:30
		});
		this.addEntity(this.currentTurnLabel);

		this.setCurrentPlayerIndex(0);

		InputEmitter.on('ARROW', this.onArrowInput.bind(this));
		InputEmitter.on('TURN_END', this.onTurnEnd.bind(this));
	},
	buildBoard: function() {
		createTiles.call(this);
		connectAdjacentTiles.call(this);

		function createTiles() {
			this.hexTiles = [];
			for(var i = 0; i <= 6; i++) {
				for(var j = 0; j <= 5; j++) {
					if(i+j*2 >= 5 && i+j*2 <=11) {
						var hexTile = this.addTileAt(i,j);
						this.hexTiles.push(hexTile);
					}
				} 
			}
		}

		function connectAdjacentTiles() {
			var _this = this;

			this.arrows = [];
			// Connect adjacent tiles with arrows
			_.each(_this.hexTiles, function(hexTile_1) {
				_.each(_this.hexTiles, function(hexTile_2) {
					if(hexTile_1 === hexTile_2) return;
					if(Math.abs(hexTile_1.a - hexTile_2.a) > 1) return;
					if(Math.abs(hexTile_1.b - hexTile_2.b) > 1) return;
					if(Math.abs(hexTile_1.a - hexTile_2.a + hexTile_1.b - hexTile_2.b) === 2) return;

					_this.connectTiles(hexTile_1, hexTile_2);
				});
			});
		}
	},
	placeArmies: function() {
		this.hexTiles[4].setArmy(this.armies[0]);
		this.hexTiles[5].setArmy(this.armies[0]);
		this.hexTiles[18].setArmy(this.armies[1]);
		this.hexTiles[19].setArmy(this.armies[1]);
	},
	onArrowInput: function(direction) {
		if(direction === 'right') {
			this.turn();
		}
	},
	turn: function() {
		var arrows = _.sortBy(this.arrows, 'order');

		// Order of events
		applyGrowth(this.hexTiles);
		_.each(arrows, function(arrow) {
			var delta = 0;

			if(!arrow.visible) return;

			if(arrow.direction === 0) {
				// MAD
				// get invasion force and atk of both sides
				// compare ATK rolls and reduce one by one until one side is out of attackers
				// then the other side attacks with remaining force against DEF
				return;
			}

			var tile_from = (arrow.direction > 0) ? arrow.tile1 : arrow.tile2;
			var tile_to = (arrow.direction < 0) ? arrow.tile1 : arrow.tile2;
			var areTilesFriendly = (tile_from.army === tile_to.army);

			if(areTilesFriendly) {
				reinforce(tile_from, tile_to);
			} else {
				invade(tile_from, tile_to, 
					Math.ceil(tile_from.units * tile_from.speed), 
					5 / (5 + 5) // atk = ( atk + def )
				);
			}

		});
		applyDeltas(this.hexTiles);
		this.tarmac.trigger('TURN_END');

		function applyGrowth(hexTiles) {
			_.each(hexTiles, function(hexTile){
				hexTile.unit_delta = hexTile.growth;
			});
		}

		function applyDeltas(hexTiles) {
			_.each(hexTiles, function(hexTile){
				hexTile.addUnits(hexTile.unit_delta);
			});
		}

		function reinforce(tile_from, tile_to) {
			var delta = Math.ceil(tile_from.units * tile_from.speed);
			tile_from.unit_delta -= delta;
			tile_to.unit_delta += delta;
		}

		function invade(tile_from, tile_to, invasion_size, invasion_power) {
			var didwin = false;
			for(var i = 0; i<invasion_size; i++) {
				if(Math.random() < invasion_power) { //TODO: factor in defense
					// one unit wins
					tile_to.unit_delta--;
					if(tile_to.units + tile_to.unit_delta <= 0) {
						didwin = true;
						break;
					}
				} else {
					// one unit loses
					tile_from.unit_delta--;
				}
			}
			if(didwin) {
				tile_to.setArmy(tile_from.army);
				tarmac.ether.trigger('HEX_STOP', [{
					tile:tile_to
				}]);
				tile_to.unit_delta = tile_to.growth + invasion_size - i; // minus units lost in battle
				tile_from.unit_delta = tile_to.growth - invasion_size;
			}
		}
	},
	onTurnEnd: function() {
		var index = this.currentPlayerIndex + 1;
		if(currentPlayerIndex === this.armies.length) {
			index = 0;
		}
		this.setCurrentPlayerIndex(index);
	},
	setCurrentPlayerIndex: function(index) {
		this.currentPlayerIndex = index;
		this.setCurrentArmy(this.armies[index]);
	},
	setCurrentArmy: function(army) {
		this.currentArmy = 
		this.currentTurnLabel.value = 
		this.currentTurnLabel.fill = army;
	},
	addTileAt: function(a, b) {
		//this.addEntity(new HexTile({ x: HexTile.hspace * a, y: HexTile.vspace * b * 2 }));
		var m = Math.random();
		var hexTile = new HexTile({
			x: HexTile.hspace * (a - 3),
			y: HexTile.vspace * ((b - 4) * 2 + a),
			a: a,
			b: b
		});
		this.addEntity(hexTile);
		return hexTile;
	},
	connectTiles: function(hexTile_1, hexTile_2) {
		if(_.indexOf(hexTile_1.connectedTiles, hexTile_2) >= 0) return;

		hexTile_1.connectedTiles.push(hexTile_2); 
		hexTile_2.connectedTiles.push(hexTile_1);

		var arrow = new Arrow({
			radius: 5,
			x: (hexTile_1.x + hexTile_2.x) / 2,
			y: (hexTile_1.y + hexTile_2.y) / 2,
			tile1: hexTile_1,
			tile2: hexTile_2,
			visible: false
		});

		this.arrows.push(arrow);
		this.addEntity(arrow);
	}
});