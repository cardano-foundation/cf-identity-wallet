import { Browser } from "@capacitor/browser";

const openBrowserLink = async (url: string) => {
  await Browser.open({
    url: url,
  });
};

export { openBrowserLink };
