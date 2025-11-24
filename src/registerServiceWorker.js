if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        // Registration successful
      })
      .catch(err => {
        // Registration failed
      });
  });
}
