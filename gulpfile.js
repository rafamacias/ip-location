var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var pkg = require('./package.json');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');


var path = {
  src: [
    './src/' + pkg.name + '.js'
  ],
  dist : _getDistribution(pkg.main)
};

gulp.task('build', function() {
    browserify({
      standalone: pkg.name,
      entries: path.src,
      debug: true
    })
    .transform(babelify)
    .bundle()
    .pipe(source(path.dist.fileDist))
    .pipe(gulp.dest(path.dist.pathDist));
});

gulp.task('production', function() {
    browserify({
      standalone: pkg.name,
      entries: path.src,
      debug: false
    })
    .transform(babelify)
    .bundle()
    .pipe(source(path.dist.fileDist))
    .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
    .pipe(uglify())
    .pipe(gulp.dest(path.dist.pathDist));
});

// WATCH FILES FOR CHANGES
gulp.task('watch', function() {
  gulp.watch(path.src, ['build']);
});


gulp.task('webserver', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});


gulp.task('default',['build', 'watch', 'webserver']);

function _getDistribution(path) {
  var aux = path.split('/');
  var fileDist = aux[aux.length -1];
  return {
    fileDist: fileDist,
    pathDist: path.replace(fileDist, '')

  };
}