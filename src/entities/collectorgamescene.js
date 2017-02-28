function rint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var colors = ['cyan', 'magenta'];

module.exports = tarmac.Scene.extend({
	speed: 5,
	distance: 0,
	orbs: [],
	freq: 150,
	score: 0,
	construct: function() {
		this._super(tarmac.viewportPresets.iPhone);

		var _this = this;

 		for(var i = 0; i < 6; i++) {
 			var divider = new tarmac.shapes.Rect({
 				width: 1,
 				height: this.viewportHeight,
 				x: (i - 2.5) * 60,
 				fill: '#333'
 			});
 			this.addEntity(divider);
 		}

		var ship = new tarmac.shapes.RoundedRect({
			width:50,
			height:10,
			y: this.viewportHeight/2 - 60,
			fill: colors[0],
			radius: 5
		});
 		this.addEntity(ship);
 		this.ship = ship;

 		this.scoreboard = new tarmac.shapes.Text({
 			value: 0,
 			y: - this.viewportHeight/2 + 30,
 			size: 20
 		});
 		this.addEntity(this.scoreboard);

 		this.output = new tarmac.shapes.Text({
 			value: this.getDebugLabel(),
 			y: this.viewportHeight/2 - 20,
 			size: 20
 		});
 		this.addEntity(this.output);

 		$(window).on('resize', function() {
 			_this.output.value = _this.getDebugLabel();
 		});

		InputEmitter.on('ARROW', function(direction){
			switch (direction) {
				case 'up' :
				case 'down' :
					if(ship.fill === colors[0]) ship.fill = colors[1];
					else if(ship.fill === colors[1]) ship.fill = colors[0];
					break;
				case 'left' :
					ship.x = Math.max(ship.x - 60, -120);
					break;
				case 'right' :
					ship.x = Math.min(ship.x + 60, 120);
					break;
			}
		});
	},
	getDebugLabel: function() {
		var displayMode = window.matchMedia('(display-mode: standalone)').matches? 'standalone' : 'browser';
		return [$(window).width(), $(window).height()].join(' x ') + ', ' + displayMode;
	},
	addOrb: function() {
		var slot_min = 0;
		var slot_max = 4;
		if(this.orbs.length) {
			var prev_slot = this.orbs[0].slot;
			slot_min = Math.max(0, prev_slot - 1);
			slot_max = Math.min(4, prev_slot + 1);
		}
		var slot = rint(slot_min, slot_max);
		var orb = new tarmac.shapes.Circle({
			fill: colors[rint(0,1)],
			radius: 10,
			y: - this.viewportHeight/2 - 20,
 			x: (slot - 2) * 60,
 			slot: slot
		});
		this.addEntity(orb);
		this.orbs.unshift(orb);
	},
	adjust: function(t, dt) {
		var adjusted_speed = this.speed * dt;
		for(var i in this.orbs) {
			var orb = this.orbs[i];
			orb.y += adjusted_speed;
			if(orb.y > this.viewportHeight/2 + 20) {
				orb.remove();
				_.remove(this.orbs, orb);
			} else if(orb.fill === this.ship.fill && orb.x === this.ship.x && Math.abs(orb.y - this.ship.y) < orb.radius) {
				orb.remove();
				_.remove(this.orbs, orb);
				this.score += 10;
			}
		}
		var mile_a = Math.floor(this.distance/this.freq);
		var mile_b = Math.floor((this.distance+adjusted_speed)/this.freq);
		if(mile_a !== mile_b) {
			this.addOrb();
			//this.freq *= 0.99;
		}
		this.distance += adjusted_speed;

		this.scoreboard.value = this.score;
	}
});