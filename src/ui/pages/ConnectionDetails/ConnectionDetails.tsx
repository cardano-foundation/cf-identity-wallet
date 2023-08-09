import { IonButton, IonIcon, IonToast } from "@ionic/react";
import { ellipsisVertical, trashOutline } from "ionicons/icons";
import { useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import { formatShortDate, formatTimeToSec } from "../../../utils";
import { CredsOptions } from "../../components/CredsOptions";
import { ConnectionDetailsProps } from "./ConnectionDetails.types";
import "./ConnectionDetails.scss";

const ConnectionDetails = ({
  connectionDetails,
  setShowConnectionDetails,
}: ConnectionDetailsProps) => {
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDelete = () => {
    setVerifyPasswordIsOpen(false);
  };

  const AdditionalButtons = () => {
    return (
      <>
        <IonButton
          shape="round"
          className="options-button"
          data-testid="options-button"
          onClick={() => {
            setOptionsIsOpen(true);
          }}
        >
          <IonIcon
            slot="icon-only"
            icon={ellipsisVertical}
            color="primary"
          />
        </IonButton>
      </>
    );
  };

  return (
    <TabLayout
      header={true}
      title={`${i18n.t("connections.details.done")}`}
      titleSize="h3"
      titleAction={() => setShowConnectionDetails(false)}
      menuButton={false}
      additionalButtons={<AdditionalButtons />}
    >
      <div className="card-details-content">
        <div className="card-details-info-block">
          <h3>{i18n.t("connections.details.label")}</h3>
          <div className="card-details-info-block-inner">
            <span className="card-details-info-block-line">
              <span className="card-details-info-block-data">
                {connectionDetails.issuer}
              </span>
            </span>
          </div>
        </div>

        <IonButton
          shape="round"
          expand="block"
          color="danger"
          data-testid="card-details-delete-button"
          className="delete-button"
          onClick={() => setAlertIsOpen(true)}
        >
          <IonIcon
            slot="icon-only"
            size="small"
            icon={trashOutline}
            color="primary"
          />
          {i18n.t("creds.card.details.delete.button")}
        </IonButton>
      </div>
      {/* <CredsOptions
          optionsIsOpen={optionsIsOpen}
          setOptionsIsOpen={setOptionsIsOpen}
          id={connectionDetails.id}
        />
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-delete"
          headerText={i18n.t("creds.card.details.delete.alert.title")}
          confirmButtonText={`${i18n.t(
            "creds.card.details.delete.alert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "creds.card.details.delete.alert.cancel"
          )}`}
          actionConfirm={() => setVerifyPasswordIsOpen(true)}
        />
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={handleDelete}
        />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={`${i18n.t("creds.card.details.toast.clipboard")}`}
          color="secondary"
          position="top"
          cssClass="credential-card-toast"
          duration={1500}
        /> */}
    </TabLayout>
  );
};

export { ConnectionDetails };
