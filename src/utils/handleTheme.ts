export const isDarkMode = () => {
  return document.body.classList.contains('dark');
};

export const toggleDark = () => {
  // window.matchMedia('(prefers-color-scheme: dark)').matches, match OS preference

  if (document.body.classList.contains('dark')) {
    document.body.classList.remove('dark');
    document.body.classList.toggle('light', true);
  } else {
    document.body.classList.remove('light');
    document.body.classList.toggle('dark', true);
  }
};

export const currentTheme = () => {
  return localStorage.getItem('theme') || 'ocean';
};

export const changeTheme = (theme: string) => {
  const div = document.getElementById('appWrapper');
  if (!div) return;

  localStorage.setItem('theme', theme);
  div.setAttribute('theme-color', theme);
};
