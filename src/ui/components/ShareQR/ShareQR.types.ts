import { CSSProperties } from "react";

interface ShareQRProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  header: {
    title: string;
    titlePosition?: CSSProperties["textAlign"];
    onRefresh?: () => Promise<void> | void;
  };
  content: {
    QRData: string;
    copyBLock?: { title?: string; content: string }[];
  };
  // eslint-disable-next-line no-undef
  moreComponent?: JSX.Element;
  modalOptions?: {
    initialBreakpoint?: number;
    breakpoints?: number[];
  };
}

export type { ShareQRProps };
