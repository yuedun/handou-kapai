/**
 * Created by admin on 2015/7/7.
 */
// 引入 gulp
var gulp = require('gulp');

// 引入组件
var jshint = require('gulp-jshint');//js语法检查
var concat = require('gulp-concat');//文件合并
var uglify = require('gulp-uglify');//js压缩
var rename = require('gulp-rename');//文件重命名
var minifycss = require('gulp-minify-css');//css压缩
var babel = require('gulp-babel');

// 检查脚本
gulp.task('jshint', function() {
    gulp.src('./public/javascripts/dev/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
// 检查api接口
gulp.task('apijshint', function() {
    gulp.src('./routes/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
    gulp.src('./services/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 合并，压缩js文件
gulp.task('minify', function() {
    //活动页面中用到的
    gulp.src('./public/javascripts/dev/weixin.activity.js')
        .pipe(rename('weixin.activity.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/javascripts/vendor'));
    gulp.src('./public/javascripts/dev/leancloud.js')
        .pipe(rename('leancloud.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/javascripts/vendor'));
    gulp.src('./public/javascripts/dev/drawpool.js')
        .pipe(rename('drawpool.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/javascripts/vendor'));
    gulp.src('./public/javascripts/dev/weixin.exchange.js')
        .pipe(rename('weixin.exchange.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/javascripts/vendor'));
});
// 合并，压缩css文件
gulp.task('weixinstyles', function() {
    //gulp.src('./public/stylesheets/dev/weixin.activity.css')
    //    .pipe(rename('weixin.activity.mini.css'))
    //    .pipe(minifycss())
    //    .pipe(gulp.dest('./public/stylesheets/vendor'));
    //资讯详情样式
    gulp.src('./public/stylesheets/dev/news.css')
        .pipe(rename('news.mini.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/stylesheets/vendor'));
});

// 监听文件变化
gulp.task('watch', function () {
    gulp.watch('public/javascripts/dev/*.js', ['jshint', 'minify']);
});
// 监视文件的变化
gulp.task('babel-watch', function () {
    // gulp.watch('public/javascripts/*.js', ['jshint', 'minify']);
    //监控文件变化，执行转换
    gulp.watch('test/SecretaryControl.js', ['babel1']);
    gulp.watch('test/SecretaryService.js', ['babel2']);
});
//ES6转ES5 此任务被默认任务依赖，需要返回任务流
gulp.task('babel1', function(){
    return gulp.src('test/SecretaryControl.js')
        .pipe(babel())
        .pipe(rename('SecretaryController.js'))
        .pipe(gulp.dest('routes/app-controller'));
});
//ES6转ES5 此任务被默认任务依赖，需要返回任务流
gulp.task('babel2', function(){
    return gulp.src('test/SecretaryService.js')
        .pipe(babel())
        .pipe(rename('SecretaryService.js'))
        .pipe(gulp.dest('services'));
});
// 默认任务
gulp.task('default', [ 'minify','weixinstyles']);
//gulp.task('default', ['apijshint']);
//gulp.task('default', ['babel1', 'babel2', 'babel-watch']);