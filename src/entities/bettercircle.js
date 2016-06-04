// extend a basic shape and add behavior
module.exports = tarmac.shapes.Circle.extend({
	
	// override default properties
	fill: 'orange',

	// update values every tick
	adjust: function(t) {
		var size = (1+Math.sin(t/300)) * 10 + 90;

		this.radius = size;

		// Try extending from "Rect" instead of "Circle"
		this.width = size;
		this.height = size;

		// Try extending from "Text" instead of "Circle"
		this.size = size;
		this.value = Math.round(size);
	}
});
