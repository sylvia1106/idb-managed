const gulp = require('gulp')
const del = require('del')
const babel = require('gulp-babel')
const runSequence = require('run-sequence').use(gulp)
const webpack = require('webpack')
const gutil = require('gulp-util')
const DemoPath = './demo'
const DistPath = './dist'

gulp.task('webpack', function(cb) {
  webpack(require('./webpack.config'), function(err, stats) {
    if (err) { throw new gutil.PluginError('webpack:build', err, { showStack: true }) }
    gutil.log('[webpack:build]', stats.toString({
      colors: true
    }))
    var jsonStats = stats.toJson()
    if (jsonStats.errors.length > 0) {
      throw new gutil.PluginError('webpack:build', jsonStats.errors.toString(), { showStack: true })
    }
    cb()
  })
})

gulp.task('html', function() {
  return gulp.src([DemoPath + '/**/*.*'])
    .pipe(gulp.dest(DistPath))
})

gulp.task('clean-webpack', function() {
  return del([
    DistPath + '/**/**'
  ])
})
gulp.task('demo', function() {
  runSequence('clean-webpack', 'webpack', 'html')
})

gulp.task('clean-npm', function() {
  return del([
    './build/**/**'
  ])
})

gulp.task('trans2js', function() {
  return gulp.src('src/**/*')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('build/js'))
})

gulp.task('build', function() {
  return gulp.src('src/**/*')
    .pipe(gulp.dest('build/es6'))
})

gulp.task('default', function() {
  runSequence('clean-npm', 'trans2js', 'build')
})