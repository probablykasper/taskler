const src = 'src/**/*'
const manifestPath = 'src/manifest.json'
const dest = 'build'
const websiteDeploy = 'docs'
const extensionZipSrc = 'build/**/*'
const extensionZipDest = 'dist'
const devServerPort = 1234
const openBrowserWhenDevServerStarts = false

require('clarify') // hides nodecore from stack trace
const gulp = require('gulp')
const del = require('del')

async function bundle (options) {
  del.sync(dest)
  const Bundler = require('parcel-bundler')
  process.env.BUILD_AS = options.buildAs
  const bundler = new Bundler(src, {
    outDir: dest,
    target: 'browser',
    cache: false, // turned off because pug.config.js output gets cached
    logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
    hmr: false,
    // sourceMaps: true,
    minify: false, // because sourcemaps aren't supported when minify is enabled
    watch: options.watch,
  })
  if (options.watch) return bundler.serve(devServerPort)
  else return bundler.bundle()
}
gulp.task('website:bundle', () => {
  return bundle({ watch: false, buildAs: 'website' })
})
gulp.task('extension:bundle', () => {
  return bundle({ watch: false, buildAs: 'extension' })
})
gulp.task('website:bundle:watch', () => {
  return new Promise(() => {
    bundle({ watch: true, buildAs: 'website' })
  })
})
gulp.task('extension:bundle:watch', () => {
  return new Promise(() => {
    bundle({ watch: true, buildAs: 'extension' })
  })
})

gulp.task('server', () => {
  const browserSync = require('browser-sync').create()
  return browserSync.init({
    server: {
      baseDir: dest
    },
    files: './src',
    open: openBrowserWhenDevServerStarts
  })
})

gulp.task('default', gulp.series('website:bundle:watch'))
gulp.task('website', gulp.series('website:bundle:watch'))
gulp.task('extension', gulp.series('extension:bundle:watch'))

gulp.task('website:deploy', async () => {
  del.sync(websiteDeploy)
  return gulp.src(dest)
    .pipe(gulp.dest(websiteDeploy))
})
gulp.task('extension:zip', async () => {
  const fs = require('fs')
  const manifest = JSON.parse(fs.readFileSync(manifestPath))
  const inquirer = require('inquirer')
  const answers = await inquirer.prompt({
    type: 'input',
    name: 'version',
    default: manifest.version,
    message: 'version:'
  })
  manifest.version = answers.version
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  await bundle({ watch: false, buildAs: 'extension' })
  const zip = require('gulp-zip')
  return gulp.src('build/**/*')
    .pipe(zip(`${manifest.name}-${manifest.version}-chrome.zip`))
    .pipe(gulp.dest('dist'))
})
