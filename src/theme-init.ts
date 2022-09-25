function detectTheme() {
  var themeOverride = localStorage.getItem('theme')
  if (themeOverride === 'dark' || themeOverride === 'light') {
    // Override the system theme
    return themeOverride
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    // Use the system theme
    return 'light'
  } else {
    // Default theme
    return 'dark'
  }
}
document.documentElement.setAttribute('data-theme', detectTheme())
