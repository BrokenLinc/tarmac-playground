var GameState = require('./hexgamestate');

var radius = 60;

var HexTile = tarmac.GameEntity.extend({
	// hitTest: 'circle' | 'rect' | 'descendants',
	// hitTestScale: 0.9,,
	units: 10,
	growth: 1,
	speed: 0.25,
	construct: function(spec) {
		this._super(spec);
		this.connectedTiles = [];

		this.bg = new tarmac.shapes.Polygon({
			points: 6,
			rotation: Math.PI/2,
			fill: '#222',
			strokeColor: 'white',
			radius: radius
		});
		this.addEntity(this.bg);

		this.token = new tarmac.shapes.Circle({
			radius: radius * 0.7,
			fill: '#444'
		});
		this.addEntity(this.token);

		this.unitLabel = new tarmac.shapes.Text({ 
			//y: -14,
			value: 0,
			size: 16,
			fill: 'white'
		});
		this.addEntity(this.unitLabel);

		this.label = new tarmac.shapes.Text({ 
			value: 'High ground',
			size: 7,
			fill: 'white',
			visible: false
		});
		this.addEntity(this.label);

		this.setUnits(this.units);
		this.setArmy(this.army);
		this.setIsSelected(false);

		tarmac.ether.on('MOUSE_DOWN', this.onMouseDown.bind(this));
		tarmac.ether.on('MOUSE_UP', this.onMouseUp.bind(this));
		tarmac.ether.on('HEX_SELECTED', this.onHexSelected.bind(this));
		tarmac.ether.on('CONTEXT_MENU', this.onContextMenu.bind(this));
	},
	hitTest: function() {
		return tarmac.utils.pointsCloserThan(this.getMouse(), {x:0,y:0}, radius * 0.86);
	},
	onMouseDown: function(e) {
		if(this.isMouseOver && !this.isSelected) {
			this.setIsSelected(true);
			tarmac.ether.trigger('HEX_SELECTED', [{ tile:this }]);
		}
	},
	onHexSelected: function(data) {
		this.setIsSelected(data.tile === this);
	},
	onMouseUp: function(e) {
		if(this.isSelected) {
			this.setIsSelected(false);
		}
	},
	onContextMenu: function(e) {
		if(this.isMouseOver) {
			tarmac.ether.trigger('HEX_STOP', [{
				tile:this
			}]);
		}
	},
	testMouse: function() {
		this.isMouseOver = this.hitTest();
		if(!this.isSelected && this.isMouseOver  && tarmac.mouse.isDown) {
			tarmac.ether.trigger('HEX_SELECTED', [{ tile:this }]);
		}
	},
	setUnits: function(value) {
		this.units = value;
		this.unitLabel.value = this.units;
	},
	addUnits: function(value) {
		this.setUnits(this.units + value);
	},
	setIsSelected: function(value) {
		this.isSelected = value;
		this.bg.strokeColor = this.isSelected? 'white' : '#444';
		this.bg.strokeWidth = this.isSelected? 2 : 1;
	},
	setArmy: function(value) {
		this.army = value || '#666';
		this.token.fill = this.army
	},
	adjust: function(t, dt) {
		this.testMouse();
		this.bg.fill = this.isMouseOver? '#444' : '#222';
	}
});

HexTile.vspace = radius * 0.87;
HexTile.hspace = Math.sin(Math.PI/180 * 60) / Math.cos(Math.PI/180 * 60) * HexTile.vspace;

module.exports = HexTile;