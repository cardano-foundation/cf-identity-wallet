import { ImgHTMLAttributes } from "react";
import { getFallbackIcon } from "./utils";

const FallbackIcon = ({
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  const fallbackIcon = src || getFallbackIcon();

  return (
    <img
      src={fallbackIcon}
      {...props}
    />
  );
};

export { FallbackIcon };
