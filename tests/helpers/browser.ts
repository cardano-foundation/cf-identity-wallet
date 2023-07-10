import { browser } from "@wdio/globals";
export async function getUrl(): Promise<URL> {
  return new URL(await browser.getUrl());
}
