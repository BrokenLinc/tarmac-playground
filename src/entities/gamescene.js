var BetterCircle = require('./bettercircle');

module.exports = tarmac.Scene.extend({
	construct: function() {
		this._super(tarmac.viewportPresets.iPhone);

		// instatiate and add child entities
		var circle = new BetterCircle();
 		this.addEntity(circle);

 		// listen for taps and swipes and change fill color

 		// a TAP is a mouse click, finger tap, spacebar or enter key
 		InputEmitter.on('TAP', function() {
 			circle.fill = 'purple';
 		});
 		// an ARROW is an arrow-key, WASD, or finger swipes
		InputEmitter.on('ARROW', function(direction){
			switch (direction) {
				case 'up' :
					circle.fill = 'red';
					break;
				case 'down' :
					circle.fill = 'blue';
					break;
				case 'left' :
					circle.fill = 'green';
					break;
				case 'right' :
					circle.fill = 'yellow';
					break;
			}
		});
	}
});