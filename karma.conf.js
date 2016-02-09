// Karma configuration
// Generated on Sat Mar 21 2015 13:31:27 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/rx/dist/rx.lite.js',
      'tests/test_harness.js',
      'tests/test_helper.js',
      'tests/test_scenarios.js',

      'tests/spec/test_common_basic_pubsub.js',

      '../pubsub-micro/dist/pubsub-a-micro.js',

      // IMPLEMENTATION SPECIFIC PATHS - ADJUST TO YOUR PHYSICAL LOCATION

      // Reference implementation - PubSub.Micro
      // '../pubsub-micro/tests/spec-validation.js',

      // node-server implementation via socket.io - Make sure the node-server runs before executing
      // the tests!
      '../pubsub-server-node/node_modules/socket.io-client/socket.io.js',
      '../pubsub-server-node/dist/pubsub-node-client.js',
      '../pubsub-server-node/tests/spec-validation.js',


      // START RUNNING THE TESTS
      'tests/run_tests.js',

    ],

    // list of files to exclude
    exclude: [
      '**/*.min.js',
      '**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'html'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'PhantomJS2', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
