interface RotateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  signingKey: string;
  onRotateKeyClick: () => Promise<void>;
}

export type { RotateKeyModalProps };
