<h1 align="center">
  Taskler
</h1>
<p align="center">
  <a href="https://taskler.kasp.io/" title="Taskler"><img alt="Quill Logo" src="https://raw.githubusercontent.com/SpectralKH/taskler/9363a32916f6f0f7316528c92a7df265a5b53d62/logo/logo.png" width="180"></a>
</p>
Taskler is a simple text editor web page. It's available as a <a href='https://taskler.kasp.io'>website</a>, <a href='https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih'>Chrome extension</a> and a <a href='https://addons.mozilla.org/addon/taskler'>Firefox extension</a>.

You can use shortcuts like cmd+B for <b>bold</b>, cmd+<i>I</i> for italics, cmd+U for <u>underline</u> and cmd+K for <a href='https://www.youtube.com/watch?v=LDU_Txk06tM'>links</a>.

# Dev Instructions

### Setup
1. Install Node.js
2. Run `npm install` to install dependencies

### Commands
- `npm run start`: Same as `npm run website`.
- `npm run website`: Build `/src` in website mode, watch for changes and start dev server at http://localhost:3000.
- `npm run extension`: Build `/src` in extension mode, watch for changes and start dev server at http://localhost:3000.
- `npm run website:deploy`: Build `/src` in website mode and deploy to `/docs` folder (GitHub Pages).
- `npm run extension:zip`: Build `/src` in extension mode and create a zip in `/dist`, ready to be uploaded to Chrome Web Store and such. You'll be prompted to type in a new version.
