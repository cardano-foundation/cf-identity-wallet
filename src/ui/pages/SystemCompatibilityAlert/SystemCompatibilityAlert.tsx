import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel } from "@ionic/react";
import { warningOutline } from "ionicons/icons";
import "./SystemCompatibilityAlert.scss";
import { DeviceInfo } from "@capacitor/device";
import { SecureStorage } from "../../../core/storage";

interface SystemCompatibilityAlertProps {
  deviceInfo: DeviceInfo | null;
}

const SystemCompatibilityAlert: React.FC<SystemCompatibilityAlertProps> = ({ deviceInfo }) => {
  const [isKeyStoreSupported, setIsKeyStoreSupported] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    SecureStorage.isKeyStoreSupported().then(isKeyStoreSup => {
      setIsKeyStoreSupported(isKeyStoreSup)
    });

  }, [])
  const getRequirementsList = () => {
    if (deviceInfo) {
      const androidMinOs = process.env.ANDROID_MIN_VERSION || "29";
      const webViewMinVersion = process.env.WEBVIEW_MIN_VERSION || "79";
      const iosMinVersion = process.env.IOS_MIN_VERSION || "13";

      const isAndroidOsMet = deviceInfo.platform === "android" && parseFloat(deviceInfo.osVersion) >= parseFloat(androidMinOs);
      const isWebViewMet = deviceInfo.platform === "android" && parseFloat(deviceInfo.webViewVersion) >= parseFloat(webViewMinVersion);
      const isIosMet = deviceInfo.platform === "ios" && parseFloat(deviceInfo.osVersion) >= parseFloat(iosMinVersion);

      if (deviceInfo.platform === "android") {
        return (
          <>
            <IonItem>
              <IonLabel>Required Android OS:</IonLabel>
              <IonLabel slot="end" color={isAndroidOsMet ? "success" : "danger"}>{androidMinOs}+</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Your Android OS:</IonLabel>
              <IonLabel slot="end" color={"primary"}>{deviceInfo.osVersion}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Required WebView:</IonLabel>
              <IonLabel slot="end" color={isWebViewMet ? "success" : "danger"}>{webViewMinVersion}+</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Your WebView:</IonLabel>
              <IonLabel slot="end" color={"primary"}>{deviceInfo.webViewVersion}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Secure Storage:</IonLabel>
              <IonLabel slot="end" color={"primary"}>{isKeyStoreSupported === undefined ? "N/A" : isKeyStoreSupported ? "Yes": "No"}</IonLabel>
            </IonItem>
          </>
        );
      } else if (deviceInfo.platform === "ios") {
        return (
          <>
            <IonItem>
              <IonLabel>Required iOS:</IonLabel>
              <IonLabel slot="end" color={isIosMet ? "success" : "danger"}>{iosMinVersion}+</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Your iOS:</IonLabel>
              <IonLabel slot="end" color={isIosMet ? "success" : "danger"}>{deviceInfo.osVersion}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Secure Storage:</IonLabel>
              <IonLabel slot="end" color={"primary"}>{isKeyStoreSupported === undefined ? "N/A" : isKeyStoreSupported ? "Yes": "No"}</IonLabel>
            </IonItem>
          </>
        );
      }
    }
    return <IonItem><IonLabel>No device information available.</IonLabel></IonItem>;
  };

  const pageId = "system-comp-alert-page";
  return (
    <IonPage className={pageId}>
      <IonContent>
        <div className="alert-container">
          <IonIcon icon={warningOutline} style={{ fontSize: "52px", color: "#d10000" }} />
          <h2>Operating system outdated</h2>
          <p>Your device's operating system does not meet the minimum requirements for secure data storage. To protect your information, update is required.</p>
          <IonList lines="full">
            {getRequirementsList()}
          </IonList>
          <p>Please consider updating your device's OS for the best security experience.</p>
          <IonButton expand="block" color="light">Contact</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SystemCompatibilityAlert;
