/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function(grunt) {

    grunt.config.set('mochaTest', {
        test: {
            options: {
                reporter: 'spec',
                captureFile: 'results.txt', // Optionally capture the reporter output to a file
                quiet: false, // Optionally suppress output to standard out (defaults to false)
                clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
            },
            src: ['test/api/services/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');

};