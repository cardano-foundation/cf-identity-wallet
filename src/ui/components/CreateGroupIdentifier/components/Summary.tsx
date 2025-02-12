import { IonCard, IonItem, IonLabel, IonIcon } from "@ionic/react";
import { pencilOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps, Stage } from "../CreateGroupIdentifier.types";
import { Alert } from "../../Alert";
import { useAppDispatch } from "../../../../store/hooks";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { Agent } from "../../../../core/agent/agent";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { showError } from "../../../utils/error";
import { ConnectionShortDetails } from "../../../../core/agent/agent.types";

const Summary = ({
  state,
  setState,
  componentId,
  setBlur,
  resetModal,
}: IdentifierStageProps) => {
  const dispatch = useAppDispatch();
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const CREATE_IDENTIFIER_BLUR_TIMEOUT = 250;
  const ourIdentifier = state.ourIdentifier;
  const [otherIdentifierContacts, setOtherIdentifierContacts] = useState<
    ConnectionShortDetails[]
  >([]);

  const createMultisigIdentifier = async () => {
    if (!ourIdentifier) {
      // eslint-disable-next-line no-console
      console.warn(
        "Attempting to create multi-sig without a corresponding normal AID to manage local keys"
      );
      return;
    } else {
      try {
        await Agent.agent.multiSigs.createGroup(
          ourIdentifier,
          otherIdentifierContacts,
          state.threshold
        );
        dispatch(
          setToastMsg(
            state.threshold === 1
              ? ToastMsgType.IDENTIFIER_CREATED
              : ToastMsgType.IDENTIFIER_REQUESTED
          )
        );
        resetModal && resetModal();
      } catch (e) {
        showError("Unable to create multi-sig", e, dispatch);
      }
    }
  };

  useEffect(() => {
    const otherIdentifierContacts = [...state.selectedConnections];
    setOtherIdentifierContacts(
      otherIdentifierContacts.sort(function (a, b) {
        const textA = a.label.toUpperCase();
        const textB = b.label.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      })
    );
  }, [state.selectedConnections]);

  const handleContinue = async () => {
    setBlur && setBlur(true);
    setTimeout(async () => {
      await createMultisigIdentifier();
    }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
  };

  const closeAlert = () => setAlertIsOpen(false);

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() =>
              setState((prevState) => ({
                ...prevState,
                identifierCreationStage: Stage.SetupThreshold,
              }))
            }
            closeButtonLabel={`${i18n.t("createidentifier.back")}`}
            title={`${i18n.t("createidentifier.confirm.title")}`}
          />
        }
      >
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.confirm.subtitle")}
        </p>
        <div>
          <div className="identifier-list-title">
            {i18n.t("createidentifier.confirm.displayname")}
          </div>
          <IonCard>
            <IonItem className="identifier-list-item">
              <IonLabel>{state.displayNameValue}</IonLabel>
            </IonItem>
          </IonCard>
        </div>
        <div>
          <div className="identifier-list-title">
            {i18n.t("createidentifier.confirm.selectedmembers")}
          </div>
          <IonCard>
            {otherIdentifierContacts.map((connection, index) => {
              return (
                <IonItem
                  key={index}
                  className="identifier-list-item"
                >
                  <IonLabel>
                    <img
                      src={connection?.logo || KeriLogo}
                      className="connection-logo"
                      alt="connection-logo"
                      data-testid={`identifier-stage-3-connection-logo-${index}`}
                    />
                    <span className="connection-name">{connection.label}</span>
                    <IonIcon
                      data-testid={`confirm-back-connection-button-${index}`}
                      aria-hidden="true"
                      icon={pencilOutline}
                      slot="end"
                      onClick={() =>
                        setState((prevState) => ({
                          ...prevState,
                          identifierCreationStage: Stage.Members,
                        }))
                      }
                    />
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonCard>
        </div>
        <div>
          <div className="identifier-list-title">
            {i18n.t("createidentifier.confirm.treshold")}
          </div>
          <IonCard>
            <IonItem className="identifier-list-item">
              <IonLabel data-testid="confirm-threshold">
                {state.threshold}
              </IonLabel>
              <IonIcon
                data-testid="confirm-back-threshold-button"
                aria-hidden="true"
                icon={pencilOutline}
                slot="end"
                onClick={() =>
                  setState((prevState) => ({
                    ...prevState,
                    identifierCreationStage: Stage.SetupThreshold,
                  }))
                }
              />
            </IonItem>
          </IonCard>
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        customClass="identifier-stage-3"
        primaryButtonText={`${i18n.t("createidentifier.confirm.continue")}`}
        primaryButtonAction={async () => handleContinue()}
        secondaryButtonText={`${i18n.t("createidentifier.confirm.cancel")}`}
        secondaryButtonAction={() => setAlertIsOpen(true)}
      />
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-cancel"
        headerText={i18n.t("createidentifier.confirm.alert.text")}
        confirmButtonText={`${i18n.t("createidentifier.confirm.alert.cancel")}`}
        cancelButtonText={`${i18n.t("createidentifier.confirm.alert.back")}`}
        actionConfirm={() => {
          setAlertIsOpen(false);
          resetModal();
        }}
        actionCancel={closeAlert}
        actionDismiss={closeAlert}
      />
    </>
  );
};

export { Summary };
