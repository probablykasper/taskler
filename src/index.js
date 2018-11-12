// quill

const noteDiv = document.querySelector('#note')

const content = localStorage.getItem('note')
if (content) {
  noteDiv.innerHTML = content
}

const quill = new Quill(noteDiv, {
  modules: {
    toolbar: { container: '#toolbar-container' },
    history: {
      maxStack: 1000
    }
  },
  formats: ['bold', 'italic', 'underline'],
  theme: 'snow',
  placeholder: 'Maybe I\'ll have a todo list here?'
})

function save () {
  localStorage.setItem('note', quill.container.innerHTML)
  localStorage.setItem('noteTime', new Date().toString())
}

quill.on('text-change', save)

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

// localStorage wrapper
function initLocalStorage (options) {
  if (localStorage.getItem(options.key) === null) {
    localStorage.setItem(options.key, options.defaultValue) // set default
  }
  options.onUpdate(localStorage.getItem(options.key)) // set value on pageload
  options.get = () => {
    return localStorage.getItem(options.key)
  }
  options.set = (value) => {
    if (options.onUpdate) options.onUpdate(value)
    localStorage.setItem(options.key, value)
  }
  // detect updates from other tabs
  function onStorage (event) {
    if (event.key === options.key) options.onUpdate(value)
  }
  if (window.addEventListener) {
    window.addEventListener('storage', onStorage, false)
  } else {
    window.attachEvent('onstorage', onStorage)
  }
  return options
}

const darkModeInput = document.querySelector('#dark-mode-checkbox')
const darkMode = initLocalStorage({
  key: 'dark-mode',
  defaultValue: 'false',
  onUpdate: (darkMode) => {
    if (darkMode === 'false') {
      body.classList.remove('dark-mode')
      body.classList.add('light-mode')
      darkModeInput.checked = false
    } else if (darkMode === 'true') {
      body.classList.remove('light-mode')
      body.classList.add('dark-mode')
      darkModeInput.checked = true
    }
  }
})
darkModeInput.addEventListener('change', (e) => {
  if (darkModeInput.checked) darkMode.set('true')
  else darkMode.set('false')
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
