import { useEffect } from "react";
import { IonCol, IonGrid, IonIcon, IonRow, isPlatform } from "@ionic/react";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { scanOutline } from "ionicons/icons";
import "./Scanner.scss";
import { i18n } from "../../../i18n";

const Scanner = () => {
  const checkPermission = async () => {
    const status = await BarcodeScanner.checkPermission({ force: true });
    if (status.granted) {
      return true;
    }
    if (status.neverAsked) {
      const allow = confirm(`${i18n.t("scan.alert.title")}`);
      if (allow) {
        return true;
      }
    }
    return false;
  };

  const startScan = async () => {
    await BarcodeScanner.hideBackground();
    document?.querySelector("body")?.classList.add("scanner-active");
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });
    return result;
  };

  const stopScan = async () => {
    await BarcodeScanner.stopScan();
    await BarcodeScanner.showBackground();
  };

  const initScan = async () => {
    if (isPlatform("ios") || isPlatform("android")) {
      const allowed = await checkPermission();
      if (allowed) {
        document?.querySelector("body")?.classList.add("scanner-active");
        BarcodeScanner.hideBackground();
        const result = await startScan();
        if (result.hasContent) {
          console.log(result.content);
        }
      }
    }
  };

  useEffect(() => {
    initScan();
  }, []);

  return (
    <IonGrid className="qr-code-scanner">
      <IonRow>
        <IonCol size="12">
          <span className="qr-code-scanner-text">
            {i18n.t("scan.tab.title")}
          </span>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonIcon
          icon={scanOutline}
          color="light"
          className="qr-code-scanner-icon"
        />
      </IonRow>
    </IonGrid>
  );
};

export default Scanner;
