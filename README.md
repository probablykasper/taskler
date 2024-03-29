<p align="center">
  <a href="https://taskler.kasper.space" title="Taskler"><img alt="Quill Logo" src="https://raw.githubusercontent.com/SpectralKH/taskler/9363a32916f6f0f7316528c92a7df265a5b53d62/logo/logo.png" width="96"></a>
</p>
<p align="center">
  <a href="https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih">
    <img alt="Chrome Web Store" src="https://img.shields.io/chrome-web-store/users/jnibmbpjkpfgaefgbnaneldfbfecpjih?color=yellow&logo=Google%20Chrome&logoColor=white&style=flat-square">
  </a>
  <a href="https://addons.mozilla.org/addon/taskler">
  <img alt="Mozilla Add-on" src="https://img.shields.io/amo/users/taskler?color=orange&logo=Firefox%20Browser&logoColor=white&style=flat-square">
  </a>
</p>
<h1 align="center">
  Taskler
</h1>
Taskler is a simple text editor web page. It's available as a <a href='https://taskler.kasper.space'>website</a>, <a href='https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih'>Chrome extension</a> and a <a href='https://addons.mozilla.org/addon/taskler'>Firefox extension</a>.

You can use shortcuts like cmd+B for <b>bold</b>, cmd+I for <i>italics</i>, cmd+U for <u>underline</u> and cmd+K for <a href='https://www.youtube.com/watch?v=LDU_Txk06tM'>links</a>.

![Screenshot](https://raw.githubusercontent.com/probablykasper/taskler/master/assets/screenshot3.png)

## Data recovery
For some reason, Brave deleted all my localStorage data, including Taskler's. This does not seem to be a problem with Taskler. If you have a backup, Taskler's data can be restored. Brave stores localStorage at in the following folder in my case:
```
~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Local Storage/leveldb
```
For Chrome, it's this folder in my case:
```
~/Library/Application Support/Google/Chrome/Profile 1/Local Storage/leveldb
```
You should be able to simply restore this folder. Keep in mind that this folder doesn't just contain Taskler's data.

What I did to restore my Taskler data was this:
1. Restore the aforementioned folder into `~/Downloads`
2. Install [golang](https://golang.org/)
3. Install [leveldb-tools](https://github.com/rchunping/leveldb-tools) by running `go get github.com/rchunping/leveldb-tools`
4. Export the database into plaintext format by running `leveldb-tools -dbpath ~/Downloads/leveldb -action export -file ~/Downloads/dumpfile.txt`
5. Open `~/Downloads/dumpfile.txt` and search for `quill-state`. If there are multiple instances of that, you might be able to tell which one is correct by the text after it.
6. Select and copy the object that is after `quill-state`, starting with `{` and ending with `}`. Unfortunately you'll have to figure out where that is. In my case, this text came after the object: `KL:=_chrome-extension://jnibmbpjkpfgaefgbnaneldfbfecpjih`.
7. In Taskler, open the developer tools and go to the `Application` tab. In the sidebar, open the item found inside `Local Storage`.
8. You'll see a table with `Key` and `Value` columns. Double-click the value of the `quill-state` key and pase in the object.

## Dev Instructions

### Setup
1. Install Node.js
2. Run `npm install` to install dependencies

### Commands
- `npm run dev:website`: Start website dev server
- `npm run dev:extension`: Build extension and watch for changes
- `npm run build:website`: Build website
- `npm run build:extension`: Build extension and create a zip in `/dist`, ready for distribution to stores
- `npm run format`: Format code and apply code suggestions
- `npm run check`: Check code

### Publish new version
1. Run `npm run check`
2. Update `CHANGELOG.md`
3. Update version in `manifest.json`
4. Run `npm run build:extension`
5. Commit with a tag in format "v#.#.#"
6. Create GitHub release with the extension zip and release notes
7. Merge `dev` into `prod` to deploy website
8. Publish to Chrome and Firefox stores
