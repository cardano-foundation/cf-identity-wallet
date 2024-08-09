enum ShareType {
  Identifier,
  Connection,
}

interface ShareConnectionProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  oobi: string;
  shareType?: ShareType;
}

export { ShareType };
export type { ShareConnectionProps };
