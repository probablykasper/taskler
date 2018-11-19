<h1 align="center">
  Taskler
</h1>
<p align="center">
  <a href="https://taskler.kasp.io/" title="Taskler"><img alt="Quill Logo" src="https://raw.githubusercontent.com/SpectralKH/taskler/9363a32916f6f0f7316528c92a7df265a5b53d62/logo/logo.png" width="180"></a>
</p>
Taskler is a simple text editor web page. It's available as a [website](https://taskler.kasp.io/), [Chrome Extension](https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih) and a [Firefox Extension](https://addons.mozilla.org/addon/taskler).

Pro-tip: You can use shortcuts like ctrl/cmd + B, I, U for <b>bold</b>, <i>italics</i>, <u>underline</u>.

# Dev Instructions

### Setup
1. Install Node.js
2. Run `npm install gulp-cli -g` to install Gulp
3. Run `npm install` to install dependencies

### Commands
Pug files receive an `isExtension` variable. Add the `--extension` flag to the `gulp` command to set it to true.
- `gulp`: Shorthand for `gulp website`.
- `gulp website`: Build `/src` in website mode, watche for changes and start dev server at http://localhost:1234.
- `gulp extension`: Build `/src` in extension mode, watche for changes and start dev server at http://localhost:1234.
- `gulp website:deploy`: Build `/src` in website mode and deploy to `/docs` folder (GitHub Pages).
- `gulp extension:zip`: Build `/src` in extension mode and create a zip in `/dist`, ready to be uploaded to Chrome Web Store and such. You'll be prompted to type in a new version.

# ToDo
- Sync
