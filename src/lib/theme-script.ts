/** Blocking inline script to prevent flash of wrong theme (FOHT). */
export const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.dataset.theme = t;
  } catch(e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;
