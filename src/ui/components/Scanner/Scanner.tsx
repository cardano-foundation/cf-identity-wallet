import { useEffect } from "react";
import { IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { qrCodeOutline } from "ionicons/icons";
import "./Scanner.scss";

const Scanner = () => {
  const startScan = async () => {
    await BarcodeScanner.checkPermission({ force: true });
    document?.querySelector("body")?.classList.add("scanner-active");
    BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      console.log(result.content);
    }
  };

  useEffect(() => {
    startScan();
  }, []);

  return (
    <IonGrid className="qr-code-scanner">
      <IonRow>
        <IonCol size="12">Align the QR code within the frame to scan</IonCol>
      </IonRow>
      <IonRow>
        <IonIcon
          slot="icon-only"
          icon={qrCodeOutline}
        />
      </IonRow>
    </IonGrid>
  );
};

export default Scanner;
