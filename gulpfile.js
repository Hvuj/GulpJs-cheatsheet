const { src, dest, task, watch, series, parallel } = require("gulp");
const gulp = require("gulp");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-terser");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

// Project related variables
const styleURL = "./dist/css/";
const styleDIST = "./dist/css/";
const styleSRC = "src/scss/style.scss";
const mapURL = "./";

const jsSRC = "script.js";
const jsDIST = "./dist/js/";
const jsFolder = "src/js/";
const jsFILES = [jsSRC];

const imgSRC = "src/images/**/*";
const imgURL = "./dist/images/";

const fontsSRC = "src/fonts/**/*";
const fontsURL = "./dist/fonts/";

const htmlSRC = "*.html";
const htmlURL = "./dist/html/";

const styleWatch = "src/scss/**/*.scss";
const jsWatch = "src/js/**/*.js";
const imgWatch = "src/images/**/*.*";
const fontsWatch = "src/fonts/**/*.*";
const htmlWatch = "*.html";

//etc...

//create browser sync task-create local host server
function browser_sync(done) {
	browserSync.init({
		open: false,
		injectChanges: true,
		// proxy: "https://gulp-cheatsheet.dev",
		// https: {
		// 	key:"",
		// 	cert:""
		// }
		server: {
			baseDir: "./"
		}
	});
	done();
}

function reload(done) {
	browserSync.reload();
	done();
}

function css(done) {
	gulp
		.src(styleSRC)
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				errorLogToConsole: true,
				outputStyle: "compressed"
			})
		)
		.on("error", console.error.bind(console))
		.pipe(
			autoprefixer({
				Browserslist: ["last 2 versions"],
				cascade: false
			})
		)
		.pipe(rename({ suffix: ".min" }))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(styleDIST))
		.pipe(browserSync.stream());
	done();
}

function js(done) {
	jsFILES.map(function(entry) {
		return browserify({
			entries: [jsFolder + entry]
		})
			.transform(babelify, { presets: ["@babel/env"] })
			.bundle()
			.pipe(source(entry))
			.pipe(rename({ extname: ".min.js" }))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(uglify())
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest(jsDIST))
			.pipe(browserSync.stream());
	});
	done();
}

function triggerPlumber(src, url) {
	return gulp
		.src(src)
		.pipe(plumber())
		.pipe(gulp.dest(url));
}

function images(done) {
	triggerPlumber(imgSRC, imgURL);
	done();
}

function fonts(done) {
	triggerPlumber(fontsSRC, fontsURL);
	done();
}

function html(done) {
	triggerPlumber(htmlSRC, htmlURL);
	done();
}

task("css", css);
task("js", js);
task("images", images);
task("fonts", fonts);
task("html", html);
task("default", parallel(css, js, images, fonts, html));

function watch_files(done) {
	watch(styleWatch, series(css, reload));
	watch(jsWatch, series(js, reload));
	watch(imgWatch, series(images, reload));
	watch(fontsWatch, series(fonts, reload));
	watch(htmlWatch, series(html, reload));
	src(jsDIST + "script.min.js").pipe(
		notify({ message: "Gulp is Watching, Happy Coding!" })
	);
	done();
}

gulp.task("watch", gulp.parallel(browser_sync, watch_files));

// gulp.task(
// 	"watch",
// 	gulp.series("default", browser_sync, function(done) {
// 		gulp.watch(styleWatch, gulp.series(css, reload));
// 		gulp.watch(jsWatch, gulp.series(js, reload));
// 		gulp.watch(htmlWatch, reload);
// 		done();
// 	})
// );
