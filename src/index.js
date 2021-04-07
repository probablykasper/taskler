import cssVars from 'css-vars-ponyfill'
cssVars()

// localStorage wrapper
function initLocalStorage (options) {
  function getItem () {
    return JSON.parse(localStorage.getItem(options.key))
  }
  function setItem (value) {
    localStorage.setItem(options.key, JSON.stringify(value))
  }
  if (localStorage.getItem(options.key) === null) {
    setItem(options.defaultValue) // set default
  }
  if (options.onUpdate) options.onUpdate(getItem()) // set value on pageload
  options.get = getItem
  options.set = (value) => {
    setItem(value)
    return options
  }
  options.update = () => {
    if (options.onUpdate) options.onUpdate(getItem())
    return options
  }
  // detect updates from other tabs
  window.addEventListener('storage', (event) => {
    console.log('stor', event)
    if (event.key === options.key && options.onUpdate) options.onUpdate(getItem())
  }, false)
  return options
}

// migrate from quill-delta to quill-state
if (localStorage.getItem('quill-delta') !== null) {
  const delta = localStorage.getItem('quill-delta')
  localStorage.setItem('quill-state', '{"delta":'+delta+',"historyStack":{"undo":[],"redo":[]}}')
  localStorage.removeItem('quill-delta')
}

let autoList
const autoListCheckbox = document.querySelector('#auto-list-checkbox')
const autoListSetting = initLocalStorage({
  key: 'auto-list',
  defaultValue: false,
  onUpdate: (newAutoListSetting) => {
    if (newAutoListSetting === true) {
      autoList = true
      if (autoListCheckbox.checked === false) autoListCheckbox.checked = true
    } else {
      autoList = false
      if (autoListCheckbox.checked === true) autoListCheckbox.checked = false
    }
  }
})
autoListCheckbox.addEventListener('change', (e) => {
  if (autoListCheckbox.checked) autoListSetting.set(true).update()
  else autoListSetting.set(false).update()
})

import Quill from '~/lib/quill.js'
import Delta from 'quill-delta';
window.quill = new Quill(document.querySelector('#note'), {
  modules: {
    toolbar: [
      [{header: [1, 2, false]}],
      ['bold', 'italic', 'underline', 'strike'],
      [{list: 'bullet'}, {list: 'ordered'}],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
    keyboard: {
      bindings: {
        'list autofill': {
          key: ' ',
          shiftKey: null,
          collapsed: true,
          format: {
            list: false,
            'code-block': false,
            blockquote: false,
            header: false,
            table: false,
          },
          prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
          handler(range, context) {
            if (!autoList) return true
            // this is part of the default handler, but causes an error for some reason:
            // if (this.quill.scroll.query('list') == null) return true;
            const { length } = context.prefix;
            const [line, offset] = this.quill.getLine(range.index);
            if (offset > length) return true;
            let value;
            switch (context.prefix.trim()) {
              case '[]':
              case '[ ]':
                value = 'unchecked';
                break;
              case '[x]':
                value = 'checked';
                break;
              case '-':
              case '*':
                value = 'bullet';
                break;
              default:
                value = 'ordered';
            }
            this.quill.insertText(range.index, ' ', Quill.sources.USER);
            this.quill.history.cutoff();
            const delta = new Delta()
              .retain(range.index - offset)
              .delete(length + 1)
              .retain(line.length() - 2 - offset)
              .retain(1, { list: value });
            this.quill.updateContents(delta, Quill.sources.USER);
            this.quill.history.cutoff();
            this.quill.setSelection(range.index - length, Quill.sources.SILENT);
            return false;
          },
        },
      },
    },
    // toolbar: { container: '#toolbar-container' },
    magicUrl: true,
    history: {
      maxStack: 1000
    }
  },
  // formats: ['header'],
  theme: 'snow',
  placeholder: 'Maybe I\'ll have a todo list here?'
})

const quillState = initLocalStorage({
  key: 'quill-state',
  defaultValue: { delta: {ops: []}, historyStack: { undo: [], redo: []} },
  onUpdate: (quillState) => {
    quill.setContents(quillState.delta, 'silent')
    quill.history.clear()
    const stack = quillState.historyStack
    for (let i = 0; i < stack.undo.length; i++) {
      const ob = {}
      ob.redo = new Delta(stack.undo[i].redo.ops)
      ob.undo = new Delta(stack.undo[i].undo.ops)
      quill.history.stack.undo.push(ob)
    }
    for (let i = 0; i < stack.redo.length; i++) {
      const ob = {}
      ob.redo = new Delta(stack.redo[i].redo.ops)
      ob.undo = new Delta(stack.redo[i].undo.ops)
      quill.history.stack.redo.push(ob)
    }
  }
})

quill.on('text-change', () => {
  quillState.set({
    delta: quill.getContents(),
    historyStack: quill.history.stack,
  })
})

// extension icons
const body = document.querySelector('body')
const isExtension = body.dataset.buildAs === 'extension'
if (!isExtension) {
  // browser version check:
  // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769
  
  // Firefox 1+
  const isFirefox = typeof InstallTrigger !== 'undefined'
  // Chrome 1+ and other Chromium-based browsers
  const isChromium = !!window.chrome

  if (isFirefox) {
    document.getElementById('firefox-extension-icon').classList.add('visible')
  } else  if (isChromium) {
    document.getElementById('chrome-extension-icon').classList.add('visible')
  }
}

const darkModeCheckbox = document.querySelector('#dark-mode-checkbox')
const darkMode = initLocalStorage({
  key: 'dark-mode',
  defaultValue: false,
  onUpdate: (newDarkMode) => {
    const darkModeDialogShadow = '0 11px 15px -7px rgba(0,0,0,.2)';
    if (newDarkMode === false) {
      // body.classList.remove('dark-mode')
      // body.classList.add('light-mode')
      cssVars({ variables: {
        'bgcolor': '#fafafa',
        'bgcolor-overlay': '#F0F0F0',
        'color': '#272727',

        'logo-dark': '#272727',
        'logo-mid': '#424242',
        'logo-light': '#696969',

        'dialog-shadow': darkModeDialogShadow + ', 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12)',
      }})
      if (darkModeCheckbox.checked === true) darkModeCheckbox.checked = false
    } else if (newDarkMode === true) {
      // body.classList.remove('light-mode')
      // body.classList.add('dark-mode')
      cssVars({ variables: {
        'bgcolor': '#151519',
        'bgcolor-overlay': '#202127',
        'color': '#fafafa',

        'logo-dark': '#fafafa',
        'logo-mid': '#bdbdbd',
        'logo-light': '#969696',

        'dialog-shadow': darkModeDialogShadow,
      }})
      if (darkModeCheckbox.checked === false) darkModeCheckbox.checked = true
    }
  }
})
darkModeCheckbox.addEventListener('change', (e) => {
  if (darkModeCheckbox.checked) darkMode.set(true).update()
  else darkMode.set(false).update()
})

const toolbarCheckbox = document.querySelector('#toolbar-checkbox')
const toolbar = document.querySelector('.ql-toolbar')
const toolbarSetting = initLocalStorage({
  key: 'toolbar',
  defaultValue: false,
  onUpdate: (newToolbarSetting) => {
    if (newToolbarSetting === true) {
      toolbar.classList.add('visible')
      if (toolbarCheckbox.checked === false) toolbarCheckbox.checked = true
    } else {
      toolbar.classList.remove('visible')
      if (toolbarCheckbox.checked === true) toolbarCheckbox.checked = false
    }
  }
})
toolbarCheckbox.addEventListener('change', (e) => {
  if (toolbarCheckbox.checked) toolbarSetting.set(true).update()
  else toolbarSetting.set(false).update()
})

// settingsDialog
const settingsIcon = document.querySelector('.settings')
const dialog = document.querySelector('.settings-dialog')
settingsIcon.addEventListener('click', () => {
  dialog.classList.add('visible')
})

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('dialog-container')) {
    var dialog = e.target
    dialog.classList.remove('visible')
  }
})

// enable transitions
window.addEventListener('load', () => {
  body.classList.remove('no-transition')
})
