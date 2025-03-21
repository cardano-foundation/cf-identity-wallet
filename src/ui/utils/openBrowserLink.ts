import { InAppBrowser } from "@capacitor/inappbrowser";

const openBrowserLink = async (url: string) => {
  await InAppBrowser.openInExternalBrowser({
    url: url,
  });
};

export { openBrowserLink };
