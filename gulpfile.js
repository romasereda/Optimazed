let gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),	// sass > css
		browserSync   = require('browser-sync'), // сервер
		concat        = require('gulp-concat'), // конкатинация (обьединение) js в один файл
		uglify        = require('gulp-uglify'), // сжатие js
		cleancss      = require('gulp-clean-css'), // чистка css
		rename        = require('gulp-rename'), // переименование
		autoprefixer  = require('gulp-autoprefixer'), // префиксы
		notify        = require('gulp-notify'), // уведомления об ошибках
		del 					= require("del"), // удаление директорий и файлов
		imagemin 			= require("gulp-imagemin"), // оптимизация изображений
		pngquant			= require("imagemin-pngquant"), // оптимизация изображений
		cache					= require("gulp-cache"); // кеширование (для оптимизации изображений)

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
	})
});

gulp.task('styles', function() {
	return gulp.src("app/sass/**/*.sass")
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

gulp.task('scripts', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // всегда в конце
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task("clean", function() {
	return del.sync("dist");
});

gulp.task("clear", function() { // чистка кеша
	return cache.clearAll();
});


gulp.task("img", function() {
	return gulp.src("app/img/**/*")
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		une: [pngquant()]
	})))
	.pipe(gulp.dest("dist/img"));
});

gulp.task('watch', function() {
	gulp.watch("app/sass/**/*.sass", gulp.parallel('styles'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
	gulp.watch('app/*.html', gulp.parallel('code'))
});
gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));

gulp.task("build", gulp.parallel("clean", "img", "styles", "scripts", function() {

	let buildCss = gulp.src("app/css/main.min.css")
	.pipe(gulp.dest("dist/css"));

	let buildFonts = gulp.src("app/fonts/**/*")
	.pipe(gulp.dest("dist/fonts"));

	let buildJs = gulp.src("app/js/scripts.min.js")
	.pipe(gulp.dest("dist/js"));

	let buildHtml = gulp.src("app/**/*.html")
	.pipe(gulp.dest("dist/"));

}));
