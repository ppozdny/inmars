/**
 * Created by user on 04.05.16.
 */

import gulp from 'gulp';
import sass from 'gulp-sass';
import browserSync from 'browser-sync';
import useref from 'gulp-useref';
import plumber from 'gulp-plumber';
import browserify from 'browserify';
import babelify from 'babelify';
import runSequence from 'run-sequence';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import eslint from 'gulp-eslint';
import postcss from 'gulp-postcss';
import del from 'del';
import minify from 'gulp-minify';


const globalConfig = {
    prodDir: "dist",
    baseDir: "./app",
    moduleDir: "node_modules"
};
const config = {
    pathDevSCSS: globalConfig.baseDir + "/scss",
    pathDevCSS: globalConfig.baseDir + "/css",
    pathDevJS: globalConfig.baseDir + "/js",
    pathDevWorkJS: globalConfig.baseDir + "/js/src",
    pathProdCSS: globalConfig.prodDir + "/css",
    pathProdJS: globalConfig.prodDir + "/js"
    //pathJQuery: globalConfig.moduleDir + "/jquery/dist"
};

const dependencies = [                    //зависимости
    //jquery
    'jquery'
];
gulp.task('useref', () =>{
    return gulp.src(globalConfig.baseDir + '/*.html')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(useref())
        .pipe(gulp.dest(globalConfig.prodDir))
});

gulp.task('minify', ['useref'],() => {
    // Минифицируем только CSS файлы
    gulp.src(config.pathProdCSS + '/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest(config.pathProdCSS));
    // Минифицируем только js файлы
    gulp.src(config.pathProdJS + '/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(config.pathProdJS));
});


gulp.task('prejs', () => {
    return gulp.src(config.pathDevWorkJS + '/*.js')
        /*.pipe(jshint({
         "lookup": true
         }))
         .pipe(jshint.reporter('default'))*/
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());

});

// синхронизация окна браузера и изменения файлов

gulp.task('watch', ['browserSync', 'sass', 'prejs'], () =>{
    gulp.watch(config.pathDevSCSS + '/**/*.scss', ['sass']);
    gulp.watch(config.pathDevCSS + '/*.css', ['css']);
    gulp.watch(globalConfig.baseDir + '/*.html', browserSync.reload);
    gulp.watch(config.pathDevWorkJS + '/*.js', ['deploy']);
    gulp.watch(config.pathDevJS + '/*.js', browserSync.reload);
});
gulp.task('css', () => {
    var cssnext = require('postcss-cssnext');
    var precss = require('precss');
    var processors = [cssnext, precss];
    return gulp.src(config.pathDevCSS + '/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest(config.pathDevCSS))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('sass', () => {
    return gulp.src(config.pathDevSCSS + '/**/*.scss')
        .pipe(sass('app/scss', {sourcemap: true}))
        .pipe(gulp.dest(config.pathDevCSS))
        .pipe(browserSync.reload({
            stream: true
        }))
});
// синхронизация окна браузера и изменения файлов
gulp.task('browserSync', () => {
    browserSync({
        server: {
            baseDir: globalConfig.baseDir
        }
    })
});
gulp.task('scripts', () => {
    runSequence('deploy',['firstCompil'],
        function(){ console.log('bundle, vendors'); }
    );
});
gulp.task('firstCompil', () => {
    bundleApp();
});
gulp.task('del', () => {
    //delete lib files
    del(config.pathDevJS + '/lib/*.js');
    del(config.pathDevCSS + '/lib/*.css');

});
gulp.task('deploy', ['prejs'], () => {
    var appBundler = browserify({
        entries: config.pathDevWorkJS + '/app.js',
        debug: true
    });
    appBundler
    // transform ES6 and JSX to ES5 with babelify
        .transform("babelify")
        .bundle()
        .on('error',gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(config.pathDevJS))

});

function bundleApp() {
    // Browserify will bundle all our js files together in to one and will let
    // us use modules in the front end.
    var appBundler = browserify({
        entries: config.pathDevWorkJS + '/app.js',
        debug: true
    });
    // If it's not for production, a separate vendors.js file will be created
    // the first time gulp is run so that we don't have to rebundle things like
    // react everytime there's a change in the js file
    browserify({
        require: dependencies,
        debug: true
    })
        .bundle()
        .on('error', gutil.log)
        .pipe(source('vendors.js'))
        .pipe(gulp.dest(config.pathDevJS));
   /* gulp.src(config.pathJQuery + '/jquery.min.js')
        .pipe(gulp.dest(config.pathDevJS + '/lib/', {}));*/


    // make the dependencies external so they dont get bundled by the
    // app bundler. Dependencies are already bundled in vendor.js for
    // development environments.
    dependencies.forEach((dep) =>{
        appBundler.external(dep);
    })


}
// запуск рабочего проекта
gulp.task('default',(callback) => {
    runSequence(['del','sass', 'scripts', 'watch'],
        () =>{
            console.log('default');
        }
    )
});

// --------------------------------------------------------------------
// Error Handler
// --------------------------------------------------------------------

var onError = function (err) {
    console.log(err);
    this.emit('end');
};