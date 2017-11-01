var gulp			= require('gulp');
var sass			= require('gulp-sass');

// Compile sass into css
gulp.task('sass', function() {
	return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'public/scss/*.scss'])
		.pipe(sass())
		.pipe(gulp.dest("public/css"));
});

gulp.task('js', function(){
	return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/tether/dist/js/tether.min.js'])
		.pipe(gulp.dest("public/js"));
});

gulp.task('default', ['js', 'sass']);
