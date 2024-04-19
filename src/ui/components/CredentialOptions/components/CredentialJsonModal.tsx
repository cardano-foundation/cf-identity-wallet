import { copyOutline, downloadOutline } from "ionicons/icons";
import { IonButton, IonIcon } from "@ionic/react";
import { ResponsiveModal } from "../../layout/ResponsiveModal";
import { PageHeader } from "../../PageHeader";
import { writeToClipboard } from "../../../utils/clipboard";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { i18n } from "../../../../i18n";
import { CredentialJsonModalProps } from "./CredentialJsonModal.types";
import { useAppDispatch } from "../../../../store/hooks";
import { ToastMsgType } from "../../../globals/types";
import "./CredentialJsonModal.scss";

const CredentialJsonModal = ({
  isOpen,
  onDissmiss: handleCloseView,
  cardData,
}: CredentialJsonModalProps) => {
  const dispatch = useAppDispatch();

  return (
    <ResponsiveModal
      componentId="view-creds-modal"
      modalIsOpen={isOpen}
      customClasses="page-layout"
      data-testid="view-creds-modal"
      onDismiss={handleCloseView}
    >
      <PageHeader
        closeButton={true}
        closeButtonLabel={`${i18n.t("credentials.details.view.cancel")}`}
        closeButtonAction={handleCloseView}
        title={`${i18n.t("credentials.details.view.title")}`}
      />
      {cardData && (
        <>
          <div className="creds-options-inner">
            <pre data-testid="cred-content">
              {JSON.stringify(cardData, null, 2)}
            </pre>
          </div>
          <div className="footer-col">
            <IonButton
              shape="round"
              expand="block"
              fill="outline"
              className="secondary-button"
              data-testid="cred-copy-json"
              onClick={() => {
                writeToClipboard(JSON.stringify(cardData, null, 2));
                dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
              }}
            >
              <IonIcon
                slot="icon-only"
                size="small"
                icon={copyOutline}
                color="primary"
              />
              {i18n.t("credentials.details.view.copy")}
            </IonButton>
            <IonButton
              shape="round"
              expand="block"
              className="primary-button"
              onClick={() => {
                // @TODO - sdisalvo: Save to device
                return;
              }}
            >
              <IonIcon
                slot="icon-only"
                size="small"
                icon={downloadOutline}
                color="primary"
              />
              {i18n.t("credentials.details.view.save")}
            </IonButton>
          </div>
        </>
      )}
    </ResponsiveModal>
  );
};

export { CredentialJsonModal };
