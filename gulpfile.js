var _ = {
	assign: require('lodash.assign')
};
var browserSync = require('browser-sync');
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var lessplugin_autoprefix = require('less-plugin-autoprefix');
var ngrok = require('ngrok');
var opn = require('opn');
var path = require('path');
var yargs = require('yargs');

var config = {
	browserSync: {
		server: './',
		ui: false,
		files: ['./*.html', './build/**/*.*'],
		startPath: '/',
		port: 8080
	},
	ngrok: {
		proto: 'http',
		addr: 8080
	},
	webpack: {
		resolve: {
			moduleDirectories: ['node_modules', 'web_modules']
		},
		output: {
			filename: 'app.js',
		}
	},
	webpack_watch: {
		resolve: {
			moduleDirectories: ['node_modules', 'web_modules']
		},
		watch: true,
		output: {
			filename: 'app.js',
		}
	}
};

var argv = yargs.argv;
var autoprefix = new lessplugin_autoprefix({ browsers: ['last 1 version', '> 0.5%'] });
var browsersync_instance = browserSync.create();
var plugins = gulpLoadPlugins();

function runTarmac() {
	var tarmacDir = './web_modules/tarmac/';
	gulp.src([
			tarmacDir + 'class.js',
			tarmacDir + 'inputemitter.js',
			tarmacDir + 'rgbcolor.js',
			tarmacDir + 'canvg.js',
			tarmacDir + 'transform.js',
			tarmacDir + 'stackblur.js',
			tarmacDir + 'tarmac.js'
		])
		.pipe(plugins.concat('tarmac.js'))
		.pipe(gulp.dest('./build/'));
	
	gulp.src([
			tarmacDir + 'class.js',
			tarmacDir + 'inputemitter.js',
			tarmacDir + 'rgbcolor.js',
			tarmacDir + 'canvg.js',
			tarmacDir + 'transform.js',
			tarmacDir + 'stackblur.js',
			tarmacDir + 'tarmic.js'
		])
		.pipe(plugins.concat('tarmic.js'))
		.pipe(gulp.dest('./build/'));
}

gulp.task('tarmac', runTarmac);

gulp.task('watch-tarmac', function(done) {
	plugins.watch('./web_modules/tarmac/**/*.js', function() {
		runTarmac(done);
	});
});

function runWebpack(optionalConfig) {
	gulp.src('./src/app.js')
		.pipe(plugins.webpack(_.assign(optionalConfig||{},config.webpack)))
		.pipe(gulp.dest('./build/'));
}

gulp.task('webpack', function() {
	runWebpack(config.webpack)
});

gulp.task('webpack-watch', function() {
	runWebpack(config.webpack_watch)
});

function runLess(done) {
	gulp.src('./src/app.less')
		.pipe(plugins.plumber({
			errorHandler: function (err) {
				done(err);
			}
		}))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.less({
			paths: ['./node_modules', './web_modules'],
			plugins: [autoprefix]
		}))
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest('./build/'));
}

gulp.task('less', runLess);

gulp.task('watch-less', function(done) {
	plugins.watch([
		'./src/**/*.less', 
		'./web_modules/**/*.less'
	],
	{ verbose:true },
	function (){
		runLess(done)
	});
});

gulp.task('browser-sync', function(done) {
	browsersync_instance.init(config.browserSync, done);
});

gulp.task('ngrok', function() {
	ngrok.connect(config.ngrok, function (err, url) {
		if(argv.open) {
			opn(url);
		}
	});
});

gulp.task('build', ['tarmac', 'webpack', 'less']);

gulp.task('dev', ['browser-sync','tarmac', 'webpack-watch', 'less', 'watch-less', 'watch-tarmac']);

gulp.task('dev-live', ['browser-sync','tarmac', 'webpack-watch',  'less', 'watch-less', 'watch-tarmac', 'ngrok']);

gulp.task('default', ['dev']);