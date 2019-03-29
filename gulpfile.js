const gulp = require('gulp')
const del = require('del')
const babel = require('gulp-babel')
const runSequence = require('run-sequence').use(gulp)

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