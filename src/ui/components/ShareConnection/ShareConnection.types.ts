enum ShareType {
  Identifier,
  Connection,
}

interface ShareConnectionProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  signifyName?: string;
  shareType?: ShareType;
}

export { ShareType };
export type { ShareConnectionProps };
