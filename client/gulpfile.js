const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const del = require('del');
const watch = require('gulp-watch');

gulp.task('build-clean', function () {
  return del(['dist']);
});

gulp.task('build-js-scripts', function () {
  return gulp
    .src([
      'src/js/app.js',
      'src/js/IndexController.js',
      'src/js/AuthHttpInterceptor.js',
      'src/js/AuthService.js',
      'src/js/Base64.js',
      'src/js/LoginController.js',
      'src/js/UserService.js',
      'src/js/UserController.js',
      'src/js/AddUserController.js',
      'src/js/EditUserController.js',
      'src/js/ResourceService.js',
      'src/js/ResourceController.js',
      'src/js/EditResourceController.js',
      'src/js/AddResourceController.js',
      'src/js/ChangeUserPasswordController.js',
      'src/js/CardService.js',
      'src/js/CardController.js',
      'src/js/EditCardController.js',
      'src/js/LogService.js',
      'src/js/LogController.js',
      'src/js/route.js',
    ])
    .pipe(concat('rfid-app.js'))
    .pipe(terser())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build-js-libs', function () {
  return gulp
    .src([
      'node_modules/angular/angular.min.js',
      'node_modules/angular-route/angular-route.min.js',
      'node_modules/angular-resource/angular-resource.min.js',
      'node_modules/angular-toastr/dist/angular-toastr.tpls.min.js',
      'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
      'node_modules/ngstorage/ngStorage.min.js',
    ])
    .pipe(gulp.dest('dist/js/lib'));
});

gulp.task('build-html-index', function () {
  return gulp.src(['src/index.html']).pipe(gulp.dest('dist'));
});

gulp.task('build-html-views', function () {
  return gulp.src(['src/views/*.html']).pipe(gulp.dest('dist/views'));
});

gulp.task('build-fonts', function () {
  return gulp
    .src(['node_modules/bootstrap/fonts/*.*'])
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('build-styles', function () {
  return gulp
    .src([
      'src/styles/*.css',
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/angular-toastr/dist/angular-toastr.min.css',
    ])
    .pipe(gulp.dest('dist/styles'));
});

// Update the build task to use gulp.series and gulp.parallel
gulp.task(
  'build',
  gulp.series(
    'build-clean',
    gulp.parallel(
      'build-js-scripts',
      'build-js-libs',
      'build-html-index',
      'build-html-views',
      'build-fonts',
      'build-styles'
    )
  )
);

gulp.task('watch', function () {
  return watch('src/**/*', function () {
    gulp.start('build');
  });
});

gulp.task('default', gulp.series('build', 'watch'));
