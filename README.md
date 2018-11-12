# Taskler
Taskler is a simple website and browser extension where you can write down stuff.

[Website](https://taskler.kasp.io/) | [Chrome Extension](https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih)

# Dev Instructions

### Setup
1. Install Node.js
2. Run `npm install gulp-cli -g` to install Gulp
3. Run `npm install` to install dependencies

### Commands
Pug files receive an `isExtension` variable. Add the `--extension` flag to the `gulp` command to set it to true.
- `gulp`: Starts the dev server at localhost:3000, compiles `/src` and watches for changes. Alias for `gulp watch server`.
- `gulp build`: Deletes `/build` and compiles `/src` into `/build`. It compiles pug into html, sass into css, js using babel. It also adds sourcemaps and autoprefixes css.
- `gulp watch`: Build and watch for changes.
- `gulp server`: Start dev server at localhost:3000.
- `gulp deploy`: Build and deploy the website to GitHub Pages (/docs folder).
- `gulp zip`: Build and zip the extension into `/dist`, ready to upload to Chrome Web Store. You'll be prompted to type in a new version.
