const devServerPort = 1234
const openBrowserWhenDevServerStarts = false

const buildSrc = 'src/**/*'
const buildDest = 'build'

const websiteDeploy = 'docs'

const extensionZipSrc = 'build/**/*'
const extensionZipDest = 'dist'
const extensionManifest = 'src/manifest.json'
const extensionName = (manifest) => `${manifest.name}-${manifest.version}-chrome-firefox.zip`

require('clarify') // hides nodecore from stack trace
const gulp = require('gulp')
const del = require('del')

async function bundle (options) {
  del.sync(buildDest)
  const Bundler = require('parcel-bundler')
  process.env.BUILD_AS = options.buildAs
  const bundler = new Bundler(buildSrc, {
    outDir: buildDest,
    target: 'browser',
    cache: false, // turned off because pug.config.js output gets cached
    logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
    hmr: false,
    sourceMaps: true,
    minify: false, // needs to be false for sourcemaps to work
    watch: options.watch,
  })
  bundler.addAssetType('.json', require.resolve('./JSONAsset.js'))
  options.server = false
  if (options.server) return bundler.serve(devServerPort)
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
      baseDir: buildDest
    },
    ghostMode: false, // disables interactions syncing between tabs, like clicks
    port: devServerPort,
    files: './src',
    open: openBrowserWhenDevServerStarts
  })
})

gulp.task('default', gulp.parallel('website:bundle:watch', 'server'))
gulp.task('website', gulp.parallel('website:bundle:watch', 'server'))
gulp.task('extension', gulp.parallel('extension:bundle:watch', 'server'))

gulp.task('website:deploy', async () => {
  del.sync(websiteDeploy)
  return gulp.src(buildDest)
    .pipe(gulp.dest(websiteDeploy))
})
gulp.task('extension:zip', async () => {
  const fs = require('fs')
  const manifest = JSON.parse(fs.readFileSync(extensionManifest))
  const inquirer = require('inquirer')
  const answers = await inquirer.prompt({
    type: 'input',
    name: 'version',
    default: manifest.version,
    message: 'version:'
  })
  manifest.version = answers.version
  fs.writeFileSync(extensionManifest, JSON.stringify(manifest, null, 2))
  await bundle({ watch: false, buildAs: 'extension' })
  const zip = require('gulp-zip')
  return gulp.src(extensionZipSrc)
    .pipe(zip(extensionName(manifest)))
    .pipe(gulp.dest(extensionZipDest))
})
