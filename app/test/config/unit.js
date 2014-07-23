// Karma configuration
// Generated on Mon Jun 09 2014 10:23:57 GMT+0300 (EEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
        //'bower_components/jasmine/*.js',
        //'bower_components/jasmine/jasmine.js',
        //'bower_components/jasmine/jasmine-html.js',
        //'bower_components/jasmine/boot.js',

        //'bower_components/jasmine/jasmine-jquery.js',

        //'dist/js/*.js',
        //'bower_components/jquery/dist/jquery.js',
        //'bower_components/angular/angular.js',
        //'bower_components/angular-route/angular-route.js',
        //'bower_components/mongolab/mongolab-resource.js',
        //'bower_components/vendor/angular/angular-mocks.js',
        //'bower_components/angular-ui/**/*.js',

        //'bower_components/**/*.js',

        //'src/app/**/*.js',
        //'test/unit/**/*.spec.js',

        'src/app/tmpTest/*.js',
        'test/unit/app/tmpTest/*.spec.js',
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'src/app/**/*.js': ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'junit', 'coverage'],

    // the default configuration
    // will be resolved to basePath (in the same way as files/exclude patterns)
    junitReporter: {
      outputFile: 'test/results/test-results.xml',
      suite: ''
    },

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
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true

    // report which specs are slower than 500ms
    // ???
    //reportSlowerThan = 500;
  });
};
