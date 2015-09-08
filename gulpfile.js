var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var typescript = require('typescript');
var karma = require('karma').server;

gulp.task('watch', function() {
  watch([
    'src/**/*.ts',
    'gulpfile.js'
  ], function() {
    gulp.start('tscompile-pubsub-interfaces');
  });
});

var defaultTsProject = ts.createProject('tsconfig.json', {
  typescript: typescript,
});

gulp.task('tscompile-pubsub-interfaces', function() {
  var tsResult = defaultTsProject.src()
    .pipe(ts(defaultTsProject));

  return tsResult.dts
    .pipe(concat('pubsub-a-interface.d.ts'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  }, done);
});

gulp.task('test-debug', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    browsers: [ 'Chrome' ],
    singleRun: false,
    debug: true
  }, done);
});

gulp.task('default', [ 'tscompile-pubsub-interfaces' ]);
