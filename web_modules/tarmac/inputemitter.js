(function() {

	var emitter = new EventEmitter();

	$.detectSwipe.threshold = 40;
	FastClick.attach(document.body);

	var input = {
		tap: function() {
			emitter.trigger('TAP');
		},
		direction: function(direction) {
			emitter.trigger('ARROW', [direction]);
		}
	};

	$(document.body)
		.on('click', 		input.tap.bind(this))
		.on('swipedown', 	input.direction.bind(this, 'up'))
		.on('swipeup', 		input.direction.bind(this, 'down'))
		.on('swipeleft', 	input.direction.bind(this, 'left'))
		.on('swiperight', 	input.direction.bind(this, 'right'));

	jwerty.key('↩/space', 	input.tap.bind(this));
	jwerty.key('↑/w', 	input.direction.bind(this, 'up'));
	jwerty.key('↓/s', 	input.direction.bind(this, 'down'));
	jwerty.key('←/a', 	input.direction.bind(this, 'left'));
	jwerty.key('→/d', 	input.direction.bind(this, 'right'));

	this.InputEmitter = emitter;

}());