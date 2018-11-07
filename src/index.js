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
  theme: 'snow',
  placeholder: 'Maybe I\'ll have a todo list here?'
})

function save () {
  localStorage.setItem('note', quill.container.innerHTML)
  localStorage.setItem('noteTime', new Date().toString())
}

quill.on('text-change', save)

// const textarea = document.querySelector('textarea')

// function resizeTextarea () {
//   textarea.style.height = 'auto'
//   const paddingTop = parseInt(getComputedStyle(textarea).paddingTop)
//   const paddingBottom = parseInt(getComputedStyle(textarea).paddingTop)
//   textarea.style.height = (textarea.scrollHeight - paddingTop - paddingBottom) + 'px'
// }

// textarea.style.overflowY = 'hidden'
// const content = localStorage.getItem('content')
// if (content) {
//   quill.setContents(JSON.parse(content.note))
// }
// resizeTextarea()
// textarea.addEventListener('input', function () {
//   resizeTextarea()
// }, false)

// function save (delta) {
//   if (!delta) delta = quill.getContents()
//   const content = {
//     time: new Date().toString(),
//     note: delta
//   }
//   localStorage.setItem('content', JSON.stringify(content))
// }

// document.addEventListener('input', function (e) {
//   const element = e.target
//   if (element.nodeName === 'TEXTAREA') {
//     save()
//   }
// })
// quill.on('text-change', function (delta, oldDelta, source) {
//   console.log(000)
//   save(delta)
// })

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
