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

  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return driver.getContexts();
}

export function getContext() {
  if (isWeb()) {
    return Promise.resolve("WEBVIEW");
  }

  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return driver.getContext();
}

export async function url(newUrl: string) {
  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  const currentUrl = await browser.getUrl();
  if (newUrl[0] === "/") {
    // Simulate baseUrl by grabbing the current url and navigating relative
    // to that
    try {
      const fullUrl = new URL(newUrl, currentUrl);
      // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-undef
      return browser.url(fullUrl.href);
    } catch (e) {
      //
    }
  }

  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return browser.url(newUrl);
}

export function pause(ms: number) {
  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return driver.pause(ms);
}

export function hideKeyboard() {
  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
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
  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return driver.isIOS;
}

export function isAndroid() {
  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return driver.isAndroid;
}

export function isWeb() {
  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return !driver.isMobile;
}

export async function setLocation(lat: number, lng: number) {
  if (isWeb()) {
    // Not available on web
    return Promise.resolve();
  }

  // eslint-disable-next-line no-undef,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
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
