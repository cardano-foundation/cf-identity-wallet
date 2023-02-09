export const isDarkMode = () => {
  console.log(document.body.classList.contains('dark'));
  return document.body.classList.contains('dark');
};

export const changeTheme = () => {
  // window.matchMedia('(prefers-color-scheme: dark)').matches, match OS preference
  const div = document.getElementById('appWrapper');
  if (!div) return;

  if (document.body.classList.contains('dark')) {
    // Ionic
    document.body.classList.remove('dark');
    document.body.classList.toggle('light', true);
    // Tailwind
    div.setAttribute('data-theme', 'light');
  } else {
    document.body.classList.remove('light');
    document.body.classList.toggle('dark', true);
    div.setAttribute('data-theme', 'dark');
  }
};
