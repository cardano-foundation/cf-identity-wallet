import WebView, { CONTEXT_REF } from "../helpers/webview";

export * from "./android";
export * from "./ios";

export async function waitForLoad() {
  if (isWeb()) {
    return Promise.resolve();
  }
  return WebView.waitForWebsiteLoaded();
}

export async function switchToNative() {
  if (isWeb()) {
    return Promise.resolve();
  }

  return WebView.switchToContext(CONTEXT_REF.NATIVE);
}

export async function switchToWeb() {
  if (isWeb()) {
    return Promise.resolve();
  }

  return WebView.switchToContext(CONTEXT_REF.WEBVIEW);
}

export async function getContexts() {
  if (isWeb()) {
    return Promise.resolve(["WEBVIEW"]);
  }

  return driver.getContexts();
}

export function getContext() {
  if (isWeb()) {
    return Promise.resolve("WEBVIEW");
  }

  return driver.getContext();
}

export async function url(newUrl: string) {
  console.log("newUrl");
  console.log(newUrl);
  // const currentUrl = await b
  console.log("browser");
  console.log(browser);
  // const currentUrl = await browser.getUrl();
  const currentUrl = await browser.getUrl();
  console.log("currentUrl");
  console.log(currentUrl);

  if (newUrl[0] === "/") {
    // Simulate baseUrl by grabbing the current url and navigating relative
    // to that
    try {
      console.log("hey1");
      console.log(newUrl);
      console.log(typeof currentUrl);
      const fullUrl = new URL(newUrl, currentUrl);
      console.log("fullUrl");
      console.log(fullUrl);
      return browser.url(fullUrl.href);
    } catch (e) {
      console.log("->error:");
      console.log(e);
    }
  }

  return browser.url(newUrl);
}

export function pause(ms: number) {
  return driver.pause(ms);
}

export function hideKeyboard() {
  return driver.hideKeyboard();
}

export function onWeb(fn: () => Promise<void>) {
  if (isWeb()) {
    return fn();
  }
}

export function onIOS(fn: () => Promise<void>) {
  if (isIOS()) {
    return fn();
  }
}
export function onAndroid(fn: () => Promise<void>) {
  if (isAndroid()) {
    return fn();
  }
}

export function isIOS() {
  return driver.isIOS;
}

export function isAndroid() {
  return driver.isAndroid;
}

export function isWeb() {
  return !driver.isMobile;
}

export async function setLocation(lat: number, lng: number) {
  if (isWeb()) {
    // Not available on web
    return Promise.resolve();
  }

  return driver.setGeoLocation({
    latitude: "" + lat,
    longitude: "" + lat,
    altitude: "94.23",
  });
}

export async function restartApp(urlPath: string) {
  // this is needed to set the "default" url on web so the DB can be cleared
  if (isWeb()) {
    return url(urlPath);
  }
}
