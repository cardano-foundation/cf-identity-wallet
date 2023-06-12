import { Clipboard } from "@capacitor/clipboard";

export const writeToClipboard = async (text: string) => {
  await Clipboard.write({
    string: text,
  });
};

export const checkClipboard = async () => {
  const { value, type } = await Clipboard.read();

  return { value, type };
};
