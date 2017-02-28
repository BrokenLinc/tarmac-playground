var GameState = require('./hexgamestate');

var selectedTile, lastSelectedTile;
tarmac.ether.on('HEX_SELECTED', function(data) {
	lastSelectedTile = selectedTile;
	selectedTile = data.tile;
});
tarmac.ether.on('MOUSE_UP', function() {
	lastSelectedTile = selectedTile = null;
});

var numArrows = 0;

module.exports = tarmac.GameEntity.extend({
	strokeColor: 'white',
	strokeWidth: 2,
	length: 12,
	size: 4,
	construct: function(spec) {
		this._super(spec);

		this.golast();

		this.baseRotation = Math.atan2( (this.tile1.y -  this.tile2.y) , (this.tile1.x -  this.tile2.x) );

		tarmac.ether.on('HEX_SELECTED', this.onHexSelected.bind(this));
		tarmac.ether.on('ARROW_SET', this.onArrowSet.bind(this));
		tarmac.ether.on('HEX_STOP', this.onHexStop.bind(this));
	},
	golast: function() {
		this.order = numArrows;
		numArrows++;
	},
	onHexSelected: function() {
		// Ignore first selection
		if(!lastSelectedTile) return;

		if(lastSelectedTile === this.tile1 && selectedTile === this.tile2) {
			// Dragged one way
			this.pushInDirection(1);
			this.visible = true;
			tarmac.ether.trigger('ARROW_SET', [{
				tile_from: this.tile1,
				tile_to: this.tile2,
				arrow: this
			}]);
		} else if (lastSelectedTile === this.tile2 && selectedTile === this.tile1) {
			// Dragged the other way
			this.pushInDirection(-1);
			this.visible = true;
			tarmac.ether.trigger('ARROW_SET', [{
				tile_from: this.tile2,
				tile_to: this.tile1,
				arrow: this
			}]);
		}
	},
	onHexStop: function(data) {
		this.disableIfPointingFrom(data.tile);
	},
	onArrowSet: function(data) {
		if(data.arrow === this) return;
		this.disableIfPointingFrom(data.tile_from);
	},
	disableIfPointingFrom: function(tile) {
		if(!this.visible) return;

		if(this.isPointingFromTile(tile)) {
			this.visible = false;
		} else if(this.direction === 0) {
			if(tile === this.tile1) {
				this.setDirection(-1);
			} else if(tile === this.tile2) {
				this.setDirection(1);
			}
		}
	},
	isPointingFromTile: function(tile) {
		if(this.direction === 1 && tile === this.tile1) {
			return true;
		}
		if(this.direction === -1 && tile === this.tile2) {
			return true;
		}
		return false;
	},
	pushInDirection: function(direction) {
		if(this.visible && this.tile1.army !== this.tile2.army && direction !== this.direction) {
			// counterattacking an existing invasion
			this.setDirection(0);
		} else {
			// reinforcement or attack
			this.setDirection(direction);
		}
	},
	setDirection: function(direction) {
		this.direction = direction;
		this.rotation = this.baseRotation + ((direction < 0) ? 0 : Math.PI);
		this.golast();
	},
	draw: function(ctx, t, dt) {
		ctx.beginPath();
		ctx.lineWidth = this.strokeWidth;
		ctx.strokeStyle = this.strokeColor;

		ctx.moveTo(-this.length,0);
		ctx.lineTo(this.length,0);

		if(this.direction===0) {
			ctx.moveTo(- this.size, - this.size);
			ctx.lineTo(this.size, this.size);
			ctx.moveTo(- this.size, this.size);
			ctx.lineTo(this.size, - this.size);
		} else {
			ctx.moveTo(this.length - this.size, - this.size);
			ctx.lineTo(this.length,0);
			ctx.lineTo(this.length - this.size, this.size);
		}
		
		ctx.stroke();

		return this;
	}
});