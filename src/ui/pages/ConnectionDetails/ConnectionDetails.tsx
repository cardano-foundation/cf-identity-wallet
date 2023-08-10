import { IonButton, IonIcon, IonPage, IonToast } from "@ionic/react";
import { ellipsisVertical, trashOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../../components/Alert";
import { formatShortDate } from "../../../utils";
import { ConnectionDetailsProps } from "./ConnectionDetails.types";
import "./ConnectionDetails.scss";
import { ConnectionsProps } from "../Connections/Connections.types";
import { PageLayout } from "../../components/layout/PageLayout";
import { RoutePath } from "../../../routes";

const ConnectionDetails = ({
  setShowConnectionDetails,
}: ConnectionDetailsProps) => {
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const history = useHistory();
  const connectionDetails = history?.location?.state as ConnectionsProps;

  useEffect(() => {
    console.log(connectionDetails);
  }, []);

  const handleDelete = () => {
    setVerifyPasswordIsOpen(false);
  };

  return (
    <IonPage className="page-layout connection-details">
      <PageLayout
        header={true}
        title={""}
        closeButtonAction={() => setShowConnectionDetails(false)}
        closeButtonLabel={`${i18n.t("connections.details.done")}`}
        currentPath={RoutePath.CONNECTION_DETAILS}
        actionButtonAction={() => {
          setOptionsIsOpen(true);
        }}
        actionButtonIcon={ellipsisVertical}
      >
        <div className="connection-details-content">
          <div className="connection-details-header">
            <div className="connection-details-logo">
              <img
                src={connectionDetails?.issuerLogo}
                alt="connection-logo"
              />
            </div>
            <span className="connection-details-issuer">
              {connectionDetails?.issuer}
            </span>
            <span className="connection-details-date">
              {formatShortDate(`${connectionDetails?.issuanceDate}`)}
            </span>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.label")}</h3>
            <div className="connection-details-info-block-inner">
              <span className="connection-details-info-block-line">
                <span className="connection-details-info-block-data">
                  {connectionDetails?.issuer}
                </span>
              </span>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.date")}</h3>
            <div className="connection-details-info-block-inner">
              <span className="connection-details-info-block-line">
                <span className="connection-details-info-block-data">
                  {formatShortDate(`${connectionDetails?.issuanceDate}`)}
                </span>
              </span>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.goalcodes")}</h3>
            <div className="connection-details-info-block-inner">
              <span className="connection-details-info-block-line">
                <span className="connection-details-info-block-data">
                  {connectionDetails?.goalCodes ||
                    i18n.t("connections.details.notavailable")}
                </span>
              </span>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.handshake")}</h3>
            <div className="connection-details-info-block-inner">
              <span className="connection-details-info-block-line">
                <span className="connection-details-info-block-data">
                  {connectionDetails?.handshakeProtocol ||
                    i18n.t("connections.details.notavailable")}
                </span>
              </span>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.attachments")}</h3>
            <div className="connection-details-info-block-inner">
              <span className="connection-details-info-block-line">
                <span className="connection-details-info-block-data">
                  {connectionDetails?.requestAttachments ||
                    i18n.t("connections.details.notavailable")}
                </span>
              </span>
            </div>
          </div>

          <div className="connection-details-info-block">
            <h3>{i18n.t("connections.details.endpoints")}</h3>
            <div className="connection-details-info-block-inner">
              <span className="connection-details-info-block-line">
                <span className="connection-details-info-block-data">
                  {connectionDetails?.serviceEndpoints ||
                    i18n.t("connections.details.notavailable")}
                </span>
              </span>
            </div>
          </div>

          <IonButton
            shape="round"
            expand="block"
            color="danger"
            data-testid="connection-details-delete-button"
            className="delete-button"
            onClick={() => setAlertIsOpen(true)}
          >
            <IonIcon
              slot="icon-only"
              size="small"
              icon={trashOutline}
              color="primary"
            />
            {i18n.t("connections.details.delete")}
          </IonButton>
        </div>
        {/* <CredsOptions
          optionsIsOpen={optionsIsOpen}
          setOptionsIsOpen={setOptionsIsOpen}
          id={connectionDetails?.id}
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
      </PageLayout>
    </IonPage>
  );
};

export { ConnectionDetails };
