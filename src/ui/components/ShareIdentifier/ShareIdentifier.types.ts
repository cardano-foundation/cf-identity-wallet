enum ShareType {
  Identifier,
  Connection,
}

interface ShareIdentifierProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  signifyName?: string;
  shareType?: ShareType;
}

export { ShareType };
export type { ShareIdentifierProps };
