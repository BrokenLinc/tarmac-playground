// game
//	canvas 				(DOM element)
//	background 			(CSS color)
//	resourceContainer	(DOM element)
//	resources			(Array/Resource)
//	sprite_animations	(Array/SpriteAnimation)
//	resourcePathPrefix	(String)

// gameEntity
//	x					(Number) // default 0
//	y					(Number) // default 0
//	resource			(String/ResourceKey)
//	scale				(Number) // default 1
//	rotate				(Number) // default 0
//	isMirrored			(Boolean)
//	isFlipped			(Boolean)
//	visible				(Boolean)
//	entities			(Array)

// start --> adjust --> draw

// Resource
//		path			(String)
//		key				(String) // optional, defaults to filename
//		spriteMap		(Object)
//			x			(Number)
//			y			(Number)
//		origin			(Object)
//			x			(Number) // default 0.5
//			y			(Number) // default 0.5

// SpriteAnimation
//	key					(String)
//	d					(Number) // Default duration of each frame
//	keyframes			(Array/SpriteFrame)

// SpriteFrame
//	x					(Number) // optional, only if changed
//	y					(Number) // optional, only if changed
//	d					(Number) // optional, only if non-default

// Gameloop Overrides & [Events]
//	gameEntity: start --> adjust --> draw
//	sprite: 	start --> adjust --> [onAnimate] --> draw

(function(){

	//private utility methods
	var add_transform = function(transform, target) {
		target.translate(transform.x, transform.y);
		target.rotate(transform.r);
		target.scale(transform.sx, transform.sy);
	};
	var remove_transform = function(transform, target) {
		target.scale(1/transform.sx, 1/transform.sy);
		target.rotate(-transform.r);
		target.translate(-transform.x, -transform.y);
	};

	var GameEntity = Class.extend({
		x: 0,
		y: 0,
		rotation: 0,
		scale: 1,
		isMirrored: false,
		isFlipped: false,
		visible: true,
		construct: function(spec) {
			this.entities = new Array();

			for(prop in spec) {
				this[prop] = spec[prop];
			}
		},
		addEntity: function() {
			for(var i in arguments) {
				arguments[i].parent = this;
				this.entities.push(arguments[i]);
			}
			return this;
		},
		removeEntity: function(e) {
			var i = this.entities.indexOf(e);
			if(i >= 0) {
				e.parent = null;
				this.entities.splice(i, 1);
			}
			return this;
		},
		remove: function() {
			this.parent && this.parent.removeEntity(this);
			return this;
		},
		init: function() {
			this.start && this.start();
			this.initChildren();
			return this;
		},
		initChildren: function() {
			for(var i = 0; i < this.entities.length; i += 1) {
				this.entities[i].init();
			}
			return this;
		},
		process: function(t) {
			var transform_cache = {
				x:this.x, y:this.y, r:this.rotation,
				sx:this.scale * (this.isMirrored? -1 : 1),
				sy:this.scale * (this.isFlipped? -1 : 1)
			};

			add_transform(transform_cache, app.mat);
			this.adjust && this.adjust(t);
			this.processChildren(t);
			remove_transform(transform_cache, app.mat);

			return this;
		},
		processChildren: function(t) {
			for(var i = 0; i < this.entities.length; i += 1) {
				this.entities[i].process(t);
			}
			return this;
		},
		update: function(t) {
			var transform_cache = {
				x:this.x, y:this.y, r:this.rotation,
				sx:this.scale * (this.isMirrored? -1 : 1),
				sy:this.scale * (this.isFlipped? -1 : 1)
			};

			add_transform(transform_cache, app.ctx);
			if(this.visible) this.draw && this.draw(t);
			this.updateChildren(t);
			if(this.visible) this.postProcess && this.postProcess(t);
			remove_transform(transform_cache, app.ctx);

			return this;
		},
		updateChildren: function(t) {
			for(var i = 0; i < this.entities.length; i += 1) {
				this.entities[i].update(t);
			}
			return this;
		}
	});

	var Scene = GameEntity.extend({
		construct: function(spec){
			this._super(spec);
			this.viewportWidth = spec.viewportWidth || 800;
			this.viewportHeight = spec.viewportHeight || 450;
		},
		process: function(t) {
			var w = app.canvas.width;
			var h = app.canvas.height;
			this.x = w/2;
			this.y = h/2;
			this.scale = Math.min(w/this.viewportWidth, h/this.viewportHeight);

			return this._super(t);
		}
	});

	var Sprite = GameEntity.extend({
		construct: function(key, spec){
			this.frame = {x: 0, y:0};
			this.resource = app.resourceManager.byKey(key);

			this._super(spec);
		},
		adjust: function(t) {
			if(this.animation) {
				var keyframe = this.animation.keyframes[this.animation_keyframe_index];
				if((new Date()).getTime() - this.animation_keyframe_index_start_time > (keyframe.d || this.animation.d)) {
					this.animation_keyframe_index++;
					if(this.animation_keyframe_index >= this.animation.keyframes.length) {
						this.animation_times++;
						if(this.animation_repeat >= 0 && this.animation_times > this.animation_repeat) {
							this.animation_complete && this.animation_complete();
							this.stop();
						} else {
							this.animation_keyframe_index = 0;
						}
					}
					if(this.animation) keyframe = this.animation.keyframes[this.animation_keyframe_index];
				}
				if(this.animation) this.frame = $.extend(this.frame, keyframe)
				this.onAnimate && this.onAnimate(t);
			}
		},
		draw: function(t) {
			app.draw_resource(this.resource, this.frame);
		},
		play: function(animationKey, repeat, complete) {
			this.animation = app.spriteAnimationManager.byKey(animationKey);
			if(this.animation) {
				this.animation_times = 0;
				this.animation_repeat = repeat;
				this.animation_keyframe_index = 0;
				this.animation_complete = complete;
				this.animation_keyframe_index_start_time = (new Date()).getTime();
			}
			return this;
		},
		playOnce: function(animationKey, complete) {
			return this.play(animationKey, 0, complete);
		},
		stop: function() {
			this.animation = null;
			return this;
		}
	});

	var Circle = GameEntity.extend({
		radius: 100,
		fill: '#888',
		construct: function(spec) {
			this._super(spec);
		},
		draw: function(t) {
			app.ctx.beginPath();
			app.ctx.lineWidth = 0;
			app.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
			app.ctx.fillStyle = this.fill;
			app.ctx.fill();
			// app.ctx.strokeStyle = '#003300';
			// app.ctx.stroke();

			return this;
		}
	});

	var Rect = GameEntity.extend({
		width: 100,
		height: 100,
		fill: '#888',
		construct: function(spec) {
			this._super(spec);
		},
		draw: function(t) {
			app.ctx.beginPath();
			app.ctx.lineWidth = 0;
			app.ctx.fillStyle = this.fill;
			app.ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
			// app.ctx.strokeStyle = '#003300';
			// app.ctx.stroke();

			return this;
		}
	});

	var Text = GameEntity.extend({
		value: 'Hello world',
		size: 16,
		fill: '#888',
		font: 'sans-serif',
		align: 'center',
		construct: function(spec) {
			this._super(spec);
		},
		draw: function(t) {
			app.ctx.font = this.size + 'px ' + this.font;
			app.ctx.fillStyle = this.fill;
			app.ctx.textAlign = this.align;
			app.ctx.fillText(this.value, 0,0); 

			return this;
		}
	});



	//Singleton App & Public Namespaces
	var app = new GameEntity();
	app.ether = new EventEmitter();
	app.GameEntity = GameEntity;
	app.Scene = Scene;
	app.Sprite = Sprite;
	app.shapes = {
		Circle: Circle,
		Rect: Rect,
		Text: Text
	};
	app.viewportPresets = {
		iPhone: {
			viewportWidth: 320,
			viewportHeight: 568
		},
		widescreen: {
			viewportWidth: 800,
			viewportHeight: 450
		}
	};
	app.setup = function(_spec) {
		var spec = _spec || {};

		var last_update;

		//global init
		app.background = spec.background || '#000';
		app.canvas = spec.canvas || document.getElementById('game-canvas');
		app.ctx = app.canvas.getContext('2d');
		app.mat = new Transform();
		app.resourceManager.container = spec.resourceContainer || $('<div/>').appendTo('body').get(0);
		app.spriteAnimationManager.load(spec.sprite_animations);

		//canvas setup
		var fit_canvas_to = function(element) {
			app.canvas.width = $(element).width();
			app.canvas.height = $(element).height();
			app.origin = {
				x: app.canvas.width/2,
				y: app.canvas.height/2
			};
		};
		var game_loop_timeout,
			doResizeCanvas = false;
		$(window).on('resize', function(){
			doResizeCanvas = true;
		}).trigger('resize');

		//preloader
		var isPreloaded = false;

		//game loopage
		var start_game_loop = function() {
			if(last_update) app.fps = 1000/((new Date()).getTime() - last_update.getTime());
			game_loop();
			game_loop_timeout = setTimeout(function(){
				window.requestAnimationFrame(start_game_loop);
			}, 20);	//throttling around 50fps seems to keep my MacBook fan from going nuts
			last_update = new Date();
		};
		var game_loop = function() {
			if(doResizeCanvas) {
				fit_canvas_to('body');
				doResizeCanvas = false;
			}
			app.clear_canvas();

			if(isPreloaded) {
				var t = new Date().getTime();
				app.process(t);
				app.update(t);
			}
		};

		//begin
		start_game_loop();
		if(spec.resources) {
			app.resourceManager.load(
				spec.resources, 
				spec.resourcePathPrefix || 'resources/', 
				function(){
					app.init();
					isPreloaded = true;
				}
			);
		} else {
			app.init();
			isPreloaded = true;
		}
	};
	app.clear_canvas = function() {
		app.ctx.fillStyle = app.background;
		app.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);
	};
	app.draw_resource = function(res, spritePos) {
		var o, w, h;
		o = res.origin || {x:0.5, y:0.5};
		w = $(res.img).width()/res.spriteMap.x;
		h = $(res.img).height()/res.spriteMap.y;

		app.ctx.drawImage(res.img,
			spritePos.x * w, spritePos.y * h,
			w, h, 
			- w * o.x, - h * o.y, 
			w, h);
	};
	app.play_sound = function(key) {
		app.resourceManager.byKey(key).sound.play();
	};
	app.resourceManager = (function() {
		var that = {},
			resources = [],
			resources_loaded = 0;

		that.container = document.body;

		that.byKey = function(key) {
			for(i in resources) {
				if(resources[i].key == key) return resources[i];
			}
		};
		that.load = function(sources, pathPrefix, complete) {
			//TODO: skip duplicates

			var image_sources = sources.images || [];
			var sound_sources = sources.sounds || [];

			if(image_sources.length + sound_sources.length == 0) {
				complete && complete();
				return;
			}

			var inc = function() {
				resources_loaded += 1;
				if(resources_loaded >= resources.length) {
					complete && complete();
					return;
				}
			};

			//TODO: only use soundManager if there are sounds to load
			soundManager.setup({
				url: pathPrefix,
				debugMode: false,
				ontimeout: function() { /* TODO: error handling */ },
				onready: load_now
			});

			function load_now() {
				for(var i = 0; i< image_sources.length; i += 1) {
					var res = $.extend({}, image_sources[i], {img: new Image()});
					if(!res.key) res.key = res.path.split('.')[0];
					resources.push(res);
					$(res.img)
						.appendTo(that.container)
						.on('load', inc)
						.attr('src', (pathPrefix || '') + res.path);
				}
				for(var i = 0; i< sound_sources.length; i += 1) {
					var res = $.extend({}, sound_sources[i]);
					res.sound = soundManager.createSound({
						url: (pathPrefix || '') + res.path
					});
					res.sound.load({ onload: inc });
					if(!res.key) res.key = res.path.split('.')[0];
					resources.push(res);
				}
			}
		}

		return that;
	}());
	app.spriteAnimationManager = (function() {
		var that = {},
			animations = [];

		that.byKey = function(key) {
			for(i in animations) {
				if(animations[i].key == key) return animations[i];
			}
		};
		that.load = function(sources) {
			animations = sources;
		}

		return that;
	}());
	app.utils = {
		// utility methods
		pointsCloserThan: function(p, q, d) {
			return Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2) < Math.pow(d,2);
		}
	};

	this.tarmac = app;

})();