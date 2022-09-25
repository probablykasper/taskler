const fs = require('fs')
const gulp = require('gulp')
const zip = require('gulp-zip')

gulp.task('zip', async () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json'))
  const zipFilename = `${manifest.name}-${manifest.version}-chrome-firefox.zip`
  console.log('dist/' + zipFilename);
  return gulp.src('build/extension/**/*')
    .pipe(zip(zipFilename))
    .pipe(gulp.dest('dist'))
})
