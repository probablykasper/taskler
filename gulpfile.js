const openBrowserWhenDevServerStarts = true

const src = 'src'
const dest = 'build'
const deploySrc = 'build/**/*'
const deploy = 'docs'

const cssSrc = 'src/**/*.{sass,scss,css}'
const htmlSrc = 'src/**/*.{pug,html}'
const jsSrc = ['src/**/*.js', '!src/lib/**']

// Files that will be copied and updated and deleted over to dest.
// Note that if you run assets or assets:watch by itself, files won't be deleted.
const assetSrc = ['src/**/!(*.sass|*.scss|*.css|*.pug|*.html|*.js)', 'src/lib/**/*']

require('clarify')
const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')

const del = require('del')
gulp.task('clean', () => {
  return del(dest)
})

gulp.task('cleanDeployDir', () => {
  return del(deploy)
})

const pug = require('gulp-pug')
gulp.task('html', () => {
  const locals = { isExtension: false }
  if (process.argv.includes('--extension')) locals.isExtension = true
  return gulp.src(htmlSrc)
    .pipe(plumber())
    .pipe(pug({ locals: locals }))
    .pipe(gulp.dest(dest))
})

const watch = require('gulp-watch')
const gulpWatchPug = require('gulp-watch-pug')
gulp.task('html:watch', () => {
  const locals = { isExtension: false }
  if (process.argv.includes('--extension')) locals.isExtension = true
  return gulp.src(htmlSrc)
    .pipe(plumber())
    .pipe(watch(htmlSrc))
    .pipe(gulpWatchPug(htmlSrc, { delay: 100 }))
    .pipe(pug({ locals: locals }))
    .pipe(gulp.dest(dest))
})

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
gulp.task('css', () => {
  return gulp.src(cssSrc)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .on('error', function () {
      // exit process because gulp-sass stops compiling after errors
      process.exit()
    })
    .pipe(autoprefixer({
      // browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(dest))
})

const watchSass = require('gulp-watch-sass')
gulp.task('css:watch', () => {
  return watchSass(cssSrc)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .on('error', function () {
      // exit process because gulp-sass stops compiling after errors
      process.exit()
    })
    .pipe(autoprefixer({
      // browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(dest))
})

const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
gulp.task('js', () => {
  return gulp.src(jsSrc)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env'],
      compact: false
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(dest))
})

gulp.task('js:watch', () => {
  return watch(jsSrc, { ignoreInitial: true })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env'],
      compact: false
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(dest))
})

const path = require('path')
gulp.task('assets', function () {
  return gulp.src(assetSrc, { base: src })
    .pipe(gulp.dest(dest))
})

gulp.task('assets:watch', () => {
  // gulp.series('assets')
  return watch(assetSrc, { base: src, ignoreInitial: true, read: false })
    .on('add', (filepath) => {
      const srcRelativeFilepath = path.relative('', filepath)
      console.log('added file', srcRelativeFilepath)
      gulp.src(srcRelativeFilepath, { base: 'src' })
        .pipe(gulp.dest(dest))
    })
    .on('change', (filepath) => {
      const srcRelativeFilepath = path.relative('', filepath)
      console.log('updated file', srcRelativeFilepath)
      gulp.src(srcRelativeFilepath, { base: 'src' })
        .pipe(gulp.dest(dest))
    })
    .on('unlink', (filepath) => {
      const srcRelativeFilepath = path.relative('', filepath)
      const relativeFilepath = path.relative(src, filepath)
      console.log('deleted file', srcRelativeFilepath)
      del(path.join(dest, relativeFilepath))
    })
})

const browserSync = require('browser-sync').create()
gulp.task('server', () => {
  return browserSync.init({
    server: {
      baseDir: dest
    },
    files: './src',
    open: openBrowserWhenDevServerStarts
  })
})

gulp.task('build', gulp.series('clean', 'css', 'html', 'js', 'assets'))
gulp.task('watch', gulp.series('build', gulp.parallel('css:watch', 'html:watch', 'js:watch', 'assets:watch')))
gulp.task('default', gulp.series('build', gulp.parallel('css:watch', 'html:watch', 'js:watch', 'assets:watch', 'server')))

// gulp.task('deploy', gulp.series('build', 'cleanDeployDir'))
gulp.task('deployToDir', () => {
  return gulp.src(deploySrc)
    .pipe(gulp.dest(deploy))
})
gulp.task('deploy', gulp.series('build', 'cleanDeployDir', 'deployToDir'))
