import { IonCard, IonItem, IonLabel, IonIcon } from "@ionic/react";
import { pencilOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { Alert } from "../../Alert";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { Agent } from "../../../../core/agent/agent";
import { ConnectionShortDetails } from "../../../pages/Connections/Connections.types";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../store/reducers/identifiersCache";
import { IdentifierShortDetails } from "../../../../core/agent/services/identifier.types";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { createThemeValue } from "../../../utils/theme";

const IdentifierStage4 = ({
  state,
  setState,
  componentId,
  setBlur,
  resetModal,
}: IdentifierStageProps) => {
  const dispatch = useAppDispatch();
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const identifiersData = useAppSelector(getIdentifiersCache);
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
      const selectedTheme = createThemeValue(state.color, state.selectedTheme);
      const { identifier, signifyName, isPending } =
        await Agent.agent.multiSigs.createMultisig(
          ourIdentifier,
          otherIdentifierContacts,
          state.threshold
        );
      if (identifier) {
        const newIdentifier: IdentifierShortDetails = {
          id: identifier,
          displayName: state.displayNameValue,
          createdAtUTC: new Date().toISOString(),
          theme: selectedTheme,
          isPending: !!isPending,
          signifyName,
          multisigManageAid: ourIdentifier,
        };
        const filteredIdentifiersData = identifiersData.filter(
          (item) => item.id !== ourIdentifier
        );
        dispatch(
          setIdentifiersCache([...filteredIdentifiersData, newIdentifier])
        );
        dispatch(
          setToastMsg(
            state.threshold === 1
              ? ToastMsgType.IDENTIFIER_CREATED
              : ToastMsgType.IDENTIFIER_REQUESTED
          )
        );
        resetModal && resetModal();
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

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() =>
              setState((prevState: IdentifierStageProps) => ({
                ...prevState,
                identifierCreationStage: 3,
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
                        setState((prevState: IdentifierStageProps) => ({
                          ...prevState,
                          identifierCreationStage: 2,
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
                  setState((prevState: IdentifierStageProps) => ({
                    ...prevState,
                    identifierCreationStage: 3,
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
        actionCancel={() => setAlertIsOpen(false)}
        actionDismiss={() => setAlertIsOpen(false)}
      />
    </>
  );
};

export { IdentifierStage4 };
