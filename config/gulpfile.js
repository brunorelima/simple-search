var gulp = require('gulp');
//var pug = require('gulp-pug');
var less = require('gulp-less');
//var minifyCSS = require('gulp-csso');
var livereload = require('gulp-livereload');



/*
gulp.task('html', function(){
  return gulp.src('client/templates/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('build/html'))
});
*/

gulp.task('css', function(){
  return gulp.src('../css/*.less')
    .pipe(less())
//    .pipe(minifyCSS())
    .pipe(gulp.dest('../css/'))
	.pipe(livereload())
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('../css/*.less', ['css']);
});

//gulp.watch('../css/*.less', function(evt) {
//	gulp.run('css');
//});

gulp.task('default', [ 'css' ]);
