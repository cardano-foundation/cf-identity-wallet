import { Keyboard } from "@capacitor/keyboard";
import { useCallback, KeyboardEvent } from "react";

const useHideKeyboard = () => {
  const hideKeyboard = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") Keyboard.hide();
  }, []);

  return {
    hideKeyboard,
  };
};

export { useHideKeyboard };
