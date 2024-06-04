const isValidHttpUrl = (urlString: string) => {
  const urlPattern =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

  const ipPattern = /^((https?:\/\/)|(www.))(\d+\.\d+\.\d+\.\d+)(:\d{1,5})?$/;

  return !!urlPattern.test(urlString) || ipPattern.test(urlString);
};

export { isValidHttpUrl };
