<p align="center">
  <a href="https://taskler.kasp.io/" title="Taskler"><img alt="Quill Logo" src="https://raw.githubusercontent.com/SpectralKH/taskler/9363a32916f6f0f7316528c92a7df265a5b53d62/logo/logo.png" width="96"></a>
</p>
<p align="center">
  <img alt="Chrome Web Store" src="https://img.shields.io/chrome-web-store/users/jnibmbpjkpfgaefgbnaneldfbfecpjih?color=yellow&logo=Google%20Chrome&logoColor=white&style=flat-square">
  <img alt="Mozilla Add-on" src="https://img.shields.io/amo/users/taskler?color=orange&logo=Firefox%20Browser&logoColor=white&style=flat-square">
</p>
<h1 align="center">
  Taskler
</h1>
Taskler is a simple text editor web page. It's available as a <a href='https://taskler.kasp.io'>website</a>, <a href='https://chrome.google.com/webstore/detail/jnibmbpjkpfgaefgbnaneldfbfecpjih'>Chrome extension</a> and a <a href='https://addons.mozilla.org/addon/taskler'>Firefox extension</a>.

You can use shortcuts like cmd+B for <b>bold</b>, cmd+I for <i>italics</i>, cmd+U for <u>underline</u> and cmd+K for <a href='https://www.youtube.com/watch?v=LDU_Txk06tM'>links</a>.

![Screenshot](https://raw.githubusercontent.com/probablykasper/taskler/master/assets/screenshot3.png)


# Dev Instructions

## Setup
1. Install Node.js
2. Run `npm install` to install dependencies

## Commands
- `npm run start`: Same as `npm run website`.
- `npm run website`: Build `/src` in website mode, watch for changes and start dev server at http://localhost:3000.
- `npm run extension`: Build `/src` in extension mode, watch for changes and start dev server at http://localhost:3000.
- `npm run website:deploy`: Build `/src` in website mode and deploy to `/docs` folder (GitHub Pages).
- `npm run extension:zip`: Build `/src` in extension mode and create a zip in `/dist`, ready to be uploaded to Chrome Web Store and such. You'll be prompted to type in a new version.

## Data recovery
For some reason, Brave deleted all my localStorage data, including Taskler's. This does not seem to be a problem with Taskler. If you have a backups, Taskler's data can be restored. Brave stores localStorage at in the following folder in my case:
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
