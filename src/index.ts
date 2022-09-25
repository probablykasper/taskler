type InitLocalStorageOptions<T> = {
  key: string;
  defaultValue: T;
  onUpdate: (value: T) => void;
}
type LocalStorageHandle<T> = {
  get: () => T;
  set: (value: T) => LocalStorageHandle<T>;
  update: () => LocalStorageHandle<T>;
}
// localStorage wrapper
function initLocalStorage<T>(options: InitLocalStorageOptions<T>) {
  const handle: LocalStorageHandle<T> = {
    get() {
      const item = localStorage.getItem(options.key)
      if (item === null) {
        return JSON.parse(JSON.stringify(options.defaultValue))
      } else {
        return JSON.parse(item)
      }
    },
    set(value) {
      setItem(value)
      return handle
    },
    update() {
      if (options.onUpdate) options.onUpdate(getItem())
      return handle
    }
  }
  function getItem () {
    const value = localStorage.getItem(options.key)
    return value === null ? null : JSON.parse(value)
  }
  function setItem (value: any) {
    localStorage.setItem(options.key, JSON.stringify(value))
  }
  if (options.onUpdate) options.onUpdate(handle.get()) // set value on pageload
  // detect updates from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === options.key && options.onUpdate) {
      console.log('stor', event)
      options.onUpdate(getItem())
    }
  }, false)
  return handle
}

// migrate from quill-delta to quill-state
if (localStorage.getItem('quill-delta') !== null) {
  const delta = localStorage.getItem('quill-delta')
  localStorage.setItem('quill-state', '{"delta":'+delta+',"historyStack":{"undo":[],"redo":[]}}')
  localStorage.removeItem('quill-delta')
}

let autoList: boolean
const autoListCheckbox = document.querySelector('#auto-list-checkbox')
if (!(autoListCheckbox instanceof HTMLInputElement)) throw alert('autoListCheckbox not found')
const autoListSetting = initLocalStorage<boolean>({
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

import Quill from 'quill'
import MagicUrl from 'quill-magic-url'
Quill.register('modules/magicUrl', MagicUrl)

import Delta from 'quill-delta';

type HistoryModule = {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  stack: {
    undo: Delta[],
    redo: Delta[],
  };
}
/** Add missing quill module types */
interface QuillInstance extends Quill {
  history: HistoryModule;
}

const noteElement = document.querySelector('#note')
if (!(noteElement instanceof HTMLElement)) throw alert('noteElement not found')
const quill: QuillInstance = new Quill(noteElement, {
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
}) as QuillInstance

type QuillState = {
  delta: Delta,
  historyStack: HistoryModule['stack'],
}
const quillState = initLocalStorage<QuillState>({
  key: 'quill-state',
  defaultValue: { delta: {ops: []}, historyStack: { undo: [], redo: []} },
  onUpdate: (quillState) => {
    quill.setContents(quillState.delta, 'silent')
    quill.history.clear()
    const stack = quillState.historyStack
    // apply historyStack which was reset by quill.setContents()
    for (let i = 0; i < stack.undo.length; i++) {
      const ob = {
        redo: new Delta(stack.undo[i].redo.ops),
        undo: new Delta(stack.undo[i].undo.ops),
      }
      quill.history.stack.undo.push(ob)
    }
    for (let i = 0; i < stack.redo.length; i++) {
      const ob = {
        redo: new Delta(stack.redo[i].redo.ops),
        undo: new Delta(stack.redo[i].undo.ops),
      }
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
const isBrowser = location.protocol === 'https:' || location.protocol === 'http:'
if (isBrowser) {
  // browser version check:
  // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769
  
  // Firefox 1+
  const isFirefox = typeof window['InstallTrigger'] !== 'undefined'
  // Chrome 1+ and other Chromium-based browsers
  const isChromium = !!window['chrome']

  if (isFirefox) {
    document.getElementById('firefox-extension-icon')?.classList.add('visible')
  } else  if (isChromium) {
    document.getElementById('chrome-extension-icon')?.classList.add('visible')
  }
}

/** There's also initial theme setup in index.pug */
function themeHandling() {
  const darkModeCheckbox = document.querySelector('#dark-mode-checkbox')
  if (!(darkModeCheckbox instanceof HTMLInputElement)) throw alert('darkModeCheckbox not found')

  function updateTheme(theme: string) {
    if (!(darkModeCheckbox instanceof HTMLInputElement)) throw alert('darkModeCheckbox not found')
    darkModeCheckbox.checked = theme === 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }
  updateTheme(document.documentElement.getAttribute('data-theme') || 'dark')
  
  // Get the systemTheme using window.matchMedia
  const prefersDarkMQ = matchMedia('(prefers-color-scheme: dark)')
  let systemTheme = prefersDarkMQ.matches ? 'dark' : 'light'
  prefersDarkMQ.onchange = (e) => {
    // Keep the systemTheme variable up to date
    systemTheme = e.matches ? 'dark' : 'light'
    // Update the theme, as long as there's no theme override
    if (localStorage.getItem('theme') === null) {
      setAndSaveTheme(systemTheme)
    }
  }

  function setAndSaveTheme(newTheme: string) {
    updateTheme(newTheme)
    if (newTheme === systemTheme) {
      // Remove override if the user sets the theme to match the system theme
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', newTheme)
    }
  }
  darkModeCheckbox.addEventListener('change', (e) => {
    if (darkModeCheckbox.checked) setAndSaveTheme('dark')
    else setAndSaveTheme('light')
  })

  // detect updates from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme') {
      console.log('stor', event)
      updateTheme(event.newValue || systemTheme)
    }
  }, false)
}
themeHandling()

const toolbarCheckbox = document.querySelector('#toolbar-checkbox')
if (!(toolbarCheckbox instanceof HTMLInputElement)) throw alert('toolbarCheckbox not found')
const toolbarSetting = initLocalStorage({
  key: 'toolbar',
  defaultValue: false,
  onUpdate: (newToolbarSetting) => {
    const toolbar = document.querySelector('.ql-toolbar')
    if (!toolbar) {
      throw alert('Toolbar element not found')
    } else if (newToolbarSetting === true) {
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
if (!settingsIcon) throw alert('Settings icon not found')
const dialog = document.querySelector('.settings-dialog')
if (!dialog) throw alert('Dialog not found')
settingsIcon.addEventListener('click', () => {
  dialog.classList.add('visible')
})

document.addEventListener('click', function (e) {
  if (e.target instanceof HTMLElement && e.target.classList.contains('dialog-container')) {
    var dialog = e.target
    dialog.classList.remove('visible')
  }
})

// enable transitions
window.addEventListener('load', () => {
  document.body.classList.remove('no-transition')
})
