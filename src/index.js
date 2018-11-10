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
  // formats: ['bold', 'italic', 'underline'],
  theme: 'snow',
  placeholder: 'Maybe I\'ll have a todo list here?'
})

function save () {
  localStorage.setItem('note', quill.container.innerHTML)
  localStorage.setItem('noteTime', new Date().toString())
}

quill.on('text-change', save)

// settingsDialog
const svg = document.querySelector('.settings svg')
const dialog = document.querySelector('.settings-dialog')
svg.addEventListener('click', () => {
  dialog.classList.add('visible')
})

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('dialog-container')) {
    var dialog = e.target
    dialog.classList.remove('visible')
    setTimeout(function () {
      dialog.classList.remove('displayed')
    }, 1000)
  }
})
