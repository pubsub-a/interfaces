var gulp = require('gulp');
var ts = require('gulp-typescript');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('typescript');
var merge = require('merge2');
var concat = require('gulp-concat');

gulp.task('watch', function() {
  watch([
    'src/**/*.ts',
    'gulpfile.js'
  ], function() {
    gulp.start('tscompile-pubsub-interfaces');
  });
});

var defaultTsProject = function() { return ts.createProject({
    target: 'ES5',
    sortOutput: true,
    noExternalResolve: true,
    typescript: require('typescript')
  });
};

gulp.task('tscompile-pubsub-interfaces', function() {
  var tsResult = gulp.src([
      './src/pubsub/pubsub-interfaces/*.ts',
    ])
    .pipe(ts(defaultTsProject()));

  return merge([
    // WTF isn't this working?
    tsResult.dts
      .pipe(concat('pubsub-a-interface.js'))
      .pipe(gulp.dest('./dist/')),
  
    tsResult.js
      .pipe(gulp.dest('./dist/'))
    ]);

});

gulp.task('default', [ 'tscompile-pubsub-interfaces' ]);
