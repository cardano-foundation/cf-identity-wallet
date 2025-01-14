import React from "react";
import { IonPage, IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel } from "@ionic/react";
import { warningOutline } from "ionicons/icons";
import "./SystemCompatibilityAlert.scss";
import { DeviceInfo } from "@capacitor/device";

const SystemCompatibilityAlert = ({ deviceInfo }: { deviceInfo: undefined | DeviceInfo }) => {
  const getRequirementsList = () => {
    if (deviceInfo) {
      const androidMinOs = 10.0;
      const webViewMinVersion = 79;
      const iosMinVersion = 13;

      const isAndroidOsMet = deviceInfo.platform === "android" && parseFloat(deviceInfo.osVersion) >= androidMinOs;
      const isWebViewMet = deviceInfo.platform === "android" && parseFloat(deviceInfo.webViewVersion) >= webViewMinVersion;
      const isIosMet = deviceInfo.platform === "ios" && parseFloat(deviceInfo.osVersion) >= iosMinVersion;

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
              <IonLabel slot="end" color={"primary"}>N/A</IonLabel>
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
              <IonLabel slot="end" color={"primary"}>N/A</IonLabel>
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
