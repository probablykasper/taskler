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

import Quill from '~/lib/quill.js'
const quill = new Quill(document.querySelector('#note'), {
  modules: {
    toolbar: [
      [{header: [1, 2, false]}],
      ['bold', 'italic', 'underline', 'strike'],
      [{list: 'bullet'}, {list: 'ordered'}],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
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

const delta = initLocalStorage({
  key: 'quill-delta',
  defaultValue: { ops: [] },
  onUpdate: (delta) => {
    quill.setContents(delta)
  }
})

quill.on('text-change', () => {
  delta.set(quill.getContents())
})

// add old taskler tasks into quill
if (localStorage.getItem('items') !== null) {
  const items = JSON.parse(localStorage.getItem('items'))
  const delta = quill.getContents()
  if ((items.repeatingTasks && items.repeatingTasks.length) || (items.tasks && items.tasks.length)) {
    delta.ops.push({
      insert: "Looks like you've used Taskler before. I imported your old tasks.\n\n"
    })
  }
  if (items.repeatingTasks && items.repeatingTasks.length) {
    for (let i = 0; i < items.repeatingTasks.length; i++) {
      delta.ops.push({
        insert: `Repeating task ${i + 1}:\n`,
        attributes: { bold: true }
      })
      delta.ops.push({
        insert: items.repeatingTasks[i].text + '\n\n'
      })
    }
  }
  if (items.tasks && items.tasks.length) {
    for (let i = 0; i < items.tasks.length; i++) {
      delta.ops.push({
        insert: `Task ${i + 1}:\n`,
        attributes: { bold: true }
      })
      delta.ops.push({
        insert: items.tasks[i] + '\n\n'
      })
    }
  }
  quill.setContents(delta)
  localStorage.removeItem('items')
}

// extension icons
const body = document.querySelector('body')
const isExtension = body.dataset.isExtension === 'true'
if (!isExtension) {
  // Opera 8.0+
  // const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
  // Firefox 1.0+
  // const isFirefox = typeof InstallTrigger !== 'undefined';
  // Safari 3.0+ "[object HTMLElementConstructor]"
  // const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))
  // Internet Explorer 6-11
  // const isIE = /*@cc_on!@*/false || !!document.documentMode
  // Edge 20+
  // const isEdge = !isIE && !!window.StyleMedia
  // Chrome 1+
  const isChrome = !!window.chrome && !!window.chrome.webstore
  // Blink engine detection
  // const isBlink = (isChrome || isOpera) && !!window.CSS

  if (isChrome) document.getElementById('chrome-extension-icon').classList.add('visible')
}

const darkModeCheckbox = document.querySelector('#dark-mode-checkbox')
const darkMode = initLocalStorage({
  key: 'dark-mode',
  defaultValue: false,
  onUpdate: (newDarkMode) => {
    if (newDarkMode === false) {
      // body.classList.remove('dark-mode')
      // body.classList.add('light-mode')
      cssVars({ variables: {
        bgcolor: '#fafafa',
        'bgcolor-overlay': '#F0F0F0',
        color: '#272727',
      }})
      if (darkModeCheckbox.checked === true) darkModeCheckbox.checked = false
    } else if (newDarkMode === true) {
      // body.classList.remove('light-mode')
      // body.classList.add('dark-mode')
      cssVars({ variables: {
        bgcolor: '#272727',
        'bgcolor-overlay': '#313131',
        color: '#fafafa',
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
  console.log(e)
  if (toolbarCheckbox.checked) toolbarSetting.set(true).update()
  else toolbarSetting.set(false).update()
})

// settingsDialog
const settingsIcon = document.querySelector('.settings')
const dialog = document.querySelector('.settings-dialog')
settingsIcon.addEventListener('click', () => {
  // document.activeElement && document.activeElement.blur()
  dialog.click()
  dialog.classList.add('visible')
  settingsIcon.blur()
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
