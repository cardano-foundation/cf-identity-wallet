import { Clipboard } from "@capacitor/clipboard";

export const writeToClipboard = async (text: string) => {
  await Clipboard.write({
    string: text,
  });
};
