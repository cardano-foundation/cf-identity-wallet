interface FullPageScannerProps {
  setShowScan: (value: boolean) => void;
}

interface ScannerRefComponent {
  stopScan: () => void;
}

export type { FullPageScannerProps, ScannerRefComponent };
