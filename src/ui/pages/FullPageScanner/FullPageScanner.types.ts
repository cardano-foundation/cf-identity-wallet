interface FullPageScannerProps {
  showScan: boolean;
  setShowScan: (value: boolean) => void;
}

interface ScannerRefComponent {
  stopScan: () => void;
}

export type { FullPageScannerProps, ScannerRefComponent };
