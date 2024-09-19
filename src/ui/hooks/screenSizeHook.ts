import { useState, useEffect } from "react";

function useScreenSize() {
  const [screenSize, setScreenSize] = useState(window?.innerWidth || 0);

  useEffect(() => {
    const onResize = () => {
      setScreenSize(window?.innerWidth || 0);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return screenSize;
}

export { useScreenSize };
