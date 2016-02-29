gulp = require('gulp');
concat = require('gulp-concat');
minify = require('gulp-minify');

gulp.task('scripts', function (){
    return gulp.src([
        './static/js/app.js',
        './static/js/IndexController.js',
        './static/js/AuthHttpInterceptor.js',
        './static/js/AuthService.js',
        './static/js/Base64.js',
        './static/js/LoginController.js',
        './static/js/UserService.js',
        './static/js/UserController.js',
        './static/js/AddUserController.js',
        './static/js/EditUserController.js',
        './static/js/ResourceService.js',
        './static/js/ResourceController.js',
        './static/js/EditResourceController.js',
        './static/js/AddResourceController.js',
        './static/js/ChangeUserPasswordController.js',
        './static/js/CardService.js',
        './static/js/CardController.js',
        './static/js/EditCardController.js',
        './static/js/LogService.js',
        './static/js/LogController.js',
        './static/js/route.js'
    ])
        .pipe(concat('rfid-app.js'))
        .pipe(minify())
        .pipe(gulp.dest('./static/js'));
});