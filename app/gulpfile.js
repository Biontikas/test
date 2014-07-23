var gulp = require('gulp'),
    yargs = require('yargs').argv,
    gulpif = require('gulp-if'),
    rimraf = require('gulp-rimraf'),
    concat = require('gulp-concat'),
    streamqueue = require('streamqueue'),
    es = require('event-stream'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    ngHtml2JS = require('gulp-ng-html2js'),
    imagemin = require('gulp-imagemin'),
    minifyHTML = require('gulp-minify-html'),
    preprocess = require('gulp-preprocess'),
    extend = require('node.extend'),
    path = require('path'),
    gulpfileLocal = 'gulpfile.local.js',
    options = {
        dist: 'dist',
        base: '/',
        env: {
            dev: !!yargs.dev,
            tests: !!yargs.tests
        },
        version: new Date().getTime(),
        clean: {
            read: false
        },
        rename: {
            suffix: '.min'
        },
        streamqueue: {
            objectMode: true
        },
        jshint: '.jshintrc',
        jshintReporter: 'default',
        minifyHTML: {
            empty: true,
            spare: true,
            quotes: true
        },
        ngHtml2JS: {
            moduleName: 'templates.app'
        },
        uglify: {
            mangle: false
        },
        imagemin: {
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }
    };

    if (path.existsSync(gulpfileLocal)) {
        options = extend(true, options, require('./'+gulpfileLocal));
    }

var css = {
        source: {
            vendors: [
                'bower_components/normalize.css/normalize.css',
                'bower_components/angular-loading-bar/build/loading-bar.min.css',
                'bower_components/AngularJS-Toaster/toaster.css'
            ],
            app: 'src/assets/less/app.less',
            watch: 'src/assets/less/**/*.less'
        },
        output: options.dist + '/css',
        filename: 'app.css'
    },
    js = {
        source: {
            vendors: [
                'bower_components/jquery/dist/jquery.min.js',
                'bower_components/underscore/underscore.js',
                'bower_components/angular/angular.min.js',
                'bower_components/angular-deferred-bootstrap/angular-deferred-bootstrap.min.js',
                'bower_components/angular-route/angular-route.min.js',
                'bower_components/angular-animate/angular-animate.min.js',
                'bower_components/angular-sanitize/angular-sanitize.min.js',
                'bower_components/angular-translate/angular-translate.min.js',
                'bower_components/angular-loading-bar/build/loading-bar.min.js',
                'bower_components/angular-bindonce/bindonce.js',
                'bower_components/AngularJS-Toaster/toaster.js'
            ],
            app: 'src/**/*.js'
        },
        output: options.dist + '/js',
        filename: 'app.js'
    },
    tpl = {
        source: 'src/app/**/*.tpl.html'
    },
    html = {
        source: 'src/index.html',
        output: options.dist
    },
    images = {
        source: 'src/assets/img/**/*',
        output: 'src/assets/img'
    },
    assets = {
        source: {
            dist: [
                'src/assets/**',
                'src/assets/.htaccess',
                '!src/assets/less{,/**}'
            ],
            js: 'bower_components/html5shiv/dist/html5shiv.min.js'
        },
        output: {
            dist: options.dist,
            js: js.output
        }
    },
    cleanDir = [options.dist + '/**/*', options.dist + '/.htaccess', '!' + options.dist + '.gitkeep'],
    release = (!options.env.dev && !options.env.tests);

// Clean
gulp.task('clean', function () {
    return gulp.src(cleanDir, options.clean)
        .pipe(rimraf());
});

// Css
gulp.task('css', function () {
    return streamqueue(options.streamqueue,
            gulp.src(css.source.vendors),
            gulp.src(css.source.app)
                .pipe(less())
        )
        .pipe(concat(css.filename))
        .pipe(gulpif(release, rename(options.rename)))
        .pipe(gulpif(release, minifyCSS()))
        .pipe(gulp.dest(css.output));
});

// Js
gulp.task('js', function () {
    return streamqueue(options.streamqueue,
            gulp.src(js.source.vendors),
            gulp.src(js.source.app)
                .pipe(gulpif(release, jshint(options.jshint)))
                .pipe(gulpif(release, jshint.reporter(options.jshintReporter))),
            gulp.src(tpl.source)
                .pipe(minifyHTML(options.minifyHTML))
                .pipe(ngHtml2JS(options.ngHtml2JS))
        )
        .pipe(concat(js.filename))
        .pipe(gulpif(release, rename(options.rename)))
        .pipe(gulpif(release, uglify(options.uglify)))
        .pipe(gulp.dest(js.output));
});

// Images
gulp.task('images', function () {
    return gulp.src(images.source)
        .pipe(imagemin(options.imagemin))
        .pipe(gulp.dest(images.output));
});

// Assets
gulp.task('assets', function () {
    return es.merge(
        gulp.src(assets.source.dist)
            .pipe(gulp.dest(assets.output.dist)),
        gulp.src(assets.source.js)
            .pipe(gulp.dest(assets.output.js))
    );
});

// Html
gulp.task('html', function () {
    return gulp.src(html.source)
        .pipe(preprocess({
            context: {
                BASE: options.base,
                VERSION: options.version,
                DEV: options.env.dev,
                RELEASE: release
            }
        }))
        .pipe(gulp.dest(html.output));
});

// Browser sync
gulp.task('browser-sync', function() {
    browserSync.init(options.dist + '/**');
});

// Watch
gulp.task('watch', ['browser-sync'], function () {
    gulp.watch(css.source.watch, ['css']);
    gulp.watch([js.source.vendors, js.source.app, tpl.source], ['js']);
    gulp.watch(images.source, ['images']);
    gulp.watch(html.source, ['html']);
    gulp.watch(assets.source.dist, ['assets']);
});

// Build
gulp.task('build', ['css', 'js', 'assets', 'html'], function () {
    if (options.env.dev) {
        gulp.start('watch');
    }
});

// Default
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});