/**
 * Created by David on 26/02/2017.
 */
//https://www.npmjs.com/package/gulp-open
//  open chrome
/*
var os = require('os');
*/
var gulp = require('gulp');
var open = require('gulp-open');
/*
var this_os = os.platform();
console.log("this os is: " + this_os);

 var browser = os.platform() === 'linux' ? 'google-chrome' : (
 os.platform() === 'darwin' ? 'google chrome' : (   // darwin = osx
 os.platform() === 'win32' ? 'chrome' : 'firefox'));
 */

// open in default browser
gulp.task('browser', function(){
    gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:8080'}));
});