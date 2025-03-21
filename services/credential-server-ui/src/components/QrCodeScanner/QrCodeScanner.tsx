import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCodeScannerProps } from "./QrCodeScanner.types";
import "./QrCodeScanner.scss";

const QrCodeScanner = ({ onScanSuccess, onScanError }: QrCodeScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrcodeScannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scannerRef.current && !html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div
      id="qr-reader"
      ref={scannerRef}
    />
  );
};

export { QrCodeScanner };
