function getTheme(value: number) {
  const themeStr = String(value);
  if (themeStr.length < 2) {
    return {
      color: 0,
      layout: value,
    };
  }

  return {
    color: Number(themeStr[0]),
    layout: Number(themeStr[1]),
  };
}

function createThemeValue(color: number, layout: number) {
  return Number(`${color}${layout}`);
}

export { getTheme, createThemeValue };
