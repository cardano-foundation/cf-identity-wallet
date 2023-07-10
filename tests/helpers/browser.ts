export async function getUrl(): Promise<URL> {
  return new URL(await browser.getUrl());
}
