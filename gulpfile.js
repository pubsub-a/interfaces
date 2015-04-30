var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var typescript = require('typescript');

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
    declarationFiles: true,
    typescript: typescript
  });
};

gulp.task('tscompile-pubsub-interfaces', function() {
  var tsResult = gulp.src([
      './src/**/*.ts',
    ])
    .pipe(ts(defaultTsProject()));

  return tsResult.dts
    .pipe(concat('pubsub-a-interface.d.ts'))
    .pipe(gulp.dest('dist/'));

});

gulp.task('default', [ 'tscompile-pubsub-interfaces' ]);
