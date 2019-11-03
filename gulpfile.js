var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var webpack = require('webpack');
var gutil = require('gulp-util');

gulp.task('webpack', function(cb) {
    webpack(require('./webpack.config'), function(err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack:build', err, {
                showStack: true
            });
        }
        gutil.log(
            '[webpack:build]',
            stats.toString({
                colors: true
            })
        );
        var jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) {
            throw new gutil.PluginError(
                'webpack:build',
                jsonStats.errors.toString(),
                { showStack: true }
            );
        }
        cb();
    });
});

gulp.task('demo', function() {
    return gulp.src(['./demo/**/*.*'])
        .pipe(gulp.dest('./dist'));
});
