import { useEffect, useState } from "react";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Share } from "@capacitor/share";
import { pencilOutline, shareOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { EditIdentityProps } from "./EditIdentity.types";
import "./EditIdentity.scss";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { VerifyPassword } from "../../components/VerifyPassword";

const EditIdentity = ({ isOpen, setIsOpen, id, name }: EditIdentityProps) => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(name);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const DISPLAY_NAME_LENGTH = 32;
  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    newDisplayName !== name;

  useEffect(() => {
    setNewDisplayName(name);
  }, [name]);

  const handleDismiss = () => {
    setEditIsOpen(false);
    setNewDisplayName(name);
    setIsOpen(false);
  };

  const handleDelete = () => {
    setActionType("delete");
    setIsOpen(false);
    setVerifyPasswordIsOpen(true);
    // TODO: handle delete identity
  };

  const handleSubmit = () => {
    setActionType("edit");
    setEditIsOpen(false);
    setIsOpen(false);
    setVerifyPasswordIsOpen(true);
  };

  const verifyAction = () => {
    if (actionType === "edit") {
      //
    } else if (actionType === "delete") {
      // TODO: handle delete identity.
      // Remember to update CardDetails file too.
    }
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        initialBreakpoint={0.33}
        breakpoints={[0.33]}
        className="page-layout"
        data-testid="edit-identity"
        onDidDismiss={handleDismiss}
      >
        <div className="modal edit-identity">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="edit-identity-title">
                <h2>{i18n.t("editidentity.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="edit-identity-body"
            color="light"
          >
            {editIsOpen ? (
              <IonGrid className="edit-identity-inner">
                <IonRow>
                  <IonCol size="12">
                    <CustomInput
                      dataTestId="edit-display-name"
                      title={`${i18n.t("editidentity.inner.label")}`}
                      hiddenInput={false}
                      autofocus={true}
                      onChangeInput={setNewDisplayName}
                      value={newDisplayName}
                    />
                  </IonCol>
                </IonRow>
                {newDisplayName.length > DISPLAY_NAME_LENGTH ? (
                  <ErrorMessage
                    message={i18n.t("editidentity.inner.error")}
                    timeout={false}
                  />
                ) : (
                  <div className="error-placeholder" />
                )}
                <IonButton
                  shape="round"
                  expand="block"
                  className="ion-primary-button"
                  data-testid="continue-button"
                  onClick={handleSubmit}
                  disabled={!verifyDisplayName}
                >
                  {i18n.t("editidentity.inner.confirm")}
                </IonButton>
              </IonGrid>
            ) : (
              <IonGrid className="edit-identity-main">
                <IonRow>
                  <IonCol size="12">
                    <span
                      className="edit-identity-option"
                      data-testid="edit-identity-edit-button"
                      onClick={() => setEditIsOpen(true)}
                    >
                      <span>
                        <IonButton shape="round">
                          <IonIcon
                            slot="icon-only"
                            icon={pencilOutline}
                          />
                        </IonButton>
                      </span>
                      <span className="edit-identity-label">
                        {i18n.t("editidentity.title")}
                      </span>
                    </span>
                    <span
                      className="edit-identity-option"
                      data-testid="edit-identity-share-button"
                      onClick={async () => {
                        await Share.share({
                          text: name + " " + id,
                        });
                      }}
                    >
                      <span>
                        <IonButton shape="round">
                          <IonIcon
                            slot="icon-only"
                            icon={shareOutline}
                          />
                        </IonButton>
                      </span>
                      <span className="edit-identity-info-block-data">
                        {i18n.t("editidentity.share")}
                      </span>
                    </span>
                    <span
                      className="edit-identity-option"
                      data-testid="edit-identity-delete-button"
                      onClick={handleDelete}
                    >
                      <span>
                        <IonButton shape="round">
                          <IonIcon
                            slot="icon-only"
                            icon={trashOutline}
                          />
                        </IonButton>
                      </span>
                      <span className="edit-identity-label">
                        {i18n.t("editidentity.delete")}
                      </span>
                    </span>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </IonContent>
        </div>
      </IonModal>
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        action={verifyAction}
      />
    </>
  );
};

export { EditIdentity };
