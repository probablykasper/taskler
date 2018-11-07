const textarea = document.querySelector('textarea')

function resizeTextarea () {
  textarea.style.height = 'auto'
  const paddingTop = parseInt(getComputedStyle(textarea).paddingTop)
  const paddingBottom = parseInt(getComputedStyle(textarea).paddingTop)
  textarea.style.height = (textarea.scrollHeight - paddingTop - paddingBottom) + 'px'
}

textarea.style.overflowY = 'hidden'
textarea.value = JSON.parse(localStorage.getItem('content')).note
resizeTextarea()
textarea.addEventListener('input', function () {
  resizeTextarea()
}, false)

function save () {
  const content = {
    time: new Date().toString(),
    note: textarea.value
  }
  localStorage.setItem('content', JSON.stringify(content))
}

document.addEventListener('input', function (e) {
  const element = e.target
  if (element.nodeName === 'TEXTAREA') {
    save()
  }
})

// 'settingsDialog'
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
