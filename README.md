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
- `gulp`: Shorthand for `gulp website`.
- `gulp website`: Build `/src` in website mode, watche for changes and start dev server at http://localhost:1234.
- `gulp extension`: Build `/src` in extension mode, watche for changes and start dev server at http://localhost:1234.
- `gulp website:deploy`: Build `/src` in website mode and deploy to `/docs` folder (GitHub Pages).
- `gulp extension:zip`: Build `/src` in extension mode and create a zip in `/dist`, ready to upload to Chrome Web Store. You'll be prompted to type in a new version.

# ToDo
- https://github.com/quilljs/awesome-quill
- Firefox/Opera/Brave/Safari/Edge
- chrome sync api? filestore sync api? https://developer.chrome.com/apps/storage
