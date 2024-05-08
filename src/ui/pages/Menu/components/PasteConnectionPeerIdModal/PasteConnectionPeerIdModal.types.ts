interface PasteConnectionPeerIdModalProps {
  onConfirm: (pid: string) => void;
  openModal: boolean;
  onCloseModal: () => void;
  onScanQR: () => void;
}

export type { PasteConnectionPeerIdModalProps };
