import { ElementSelector } from "../definitions";

export function findElementAndroid({ text }: ElementSelector) {
  if (text) {
    return $(`android=new UiSelector().text("${text}")`);
  } else {
    throw new Error("Unknown selector strategy");
  }
}
