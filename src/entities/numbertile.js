var Seeker = require('./seeker');
var Tile = require('./tile');

var tileColors = {
	'2':    '#fff',
	'4':    '#fc8',
	'8':    '#f80',
	'16':   '#f88',
	'32':   '#f00',
	'64':   '#fff',
	'128':  '#fff',
	'256':  '#fff',
	'512':  '#fff',
	'1024': '#fff',
	'2048': '#fff'
};

module.exports = Seeker.extend({
	number: 2,
	scale: 0,
	seekscale: 1,
	construct: function(spec) {
		this._super(spec);

		this.surface = new Tile({
			fill: 'white'
		});
		this.addEntity(this.surface);

		this.label = new tarmac.shapes.Text({
			value: this.number,
			fill: 'black',
			size: 24
		});
		this.addEntity(this.label);
	},
	double: function() {
		this.number *= 2;
		this.label.value = this.number;
		this.surface.fill = tileColors[this.number];
		if(this.number === 2048) {
			bootbox.alert('You win!');
		}
	},
	flagForDeletion: function() {
		//console.log(this.id + ': flagForDeletion');
		this.flaggedForDeletion = true;
		this.seekscale = 0;
		//console.log(this.flaggedForDeletion);
	},
	onScaleDone: function() {
		// console.log(this.id + ': onScaleDone');
		// console.log(this.flaggedForDeletion);
		if(this.flaggedForDeletion) {
			this.remove();
		}
	}
});
