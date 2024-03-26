import { IonCard, IonItem, IonLabel, IonIcon } from "@ionic/react";
import { pencilOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import CardanoLogo from "../../../assets/images/CardanoLogo.jpg";
import { Alert } from "../../Alert";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getAuthentication,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { AriesAgent } from "../../../../core/agent/agent";
import { ConnectionShortDetails } from "../../../pages/Connections/Connections.types";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../store/reducers/identifiersCache";
import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../../../core/agent/services/identifierService.types";

const IdentifierStage3 = ({
  state,
  setState,
  componentId,
  setBlur,
  resetModal,
}: IdentifierStageProps) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  // @TODO - sdisalvo: This is a temporary fix to get the identifier created.
  // We'll need to work out a proper way to get 'ourIdentifier'.
  const identifiersData = useAppSelector(getIdentifiersCache);
  const CREATE_IDENTIFIER_BLUR_TIMEOUT = 250;
  const ourIdentifier = identifiersData.find(
    (identifier) => identifier.method === IdentifierType.KERI
  )?.id;
  const [otherIdentifierContacts, setOtherIdentifierContacts] = useState<
    ConnectionShortDetails[]
  >([]);

  const createMultisigIdentifier = async () => {
    if (!ourIdentifier) {
      // @TODO - sdisalvo: Leaving this until we have a story to add a proper
      // logger to the project so we can adjust the log level and timestamp it.
      // eslint-disable-next-line no-console
      console.warn(
        "Attempting to create multi-sig without a corresponding normal AID to manage local keys"
      );
      return;
    } else {
      const identifier = await AriesAgent.agent.identifiers.createMultisig(
        ourIdentifier,
        otherIdentifierContacts,
        {
          theme: state.selectedTheme,
          // @TODO - sdisalvo: Colors will need to be removed
          colors: ["#000000", "#000000"],
          displayName: state.displayNameValue,
        },
        state.threshold
      );
      if (identifier) {
        const newIdentifier: IdentifierShortDetails = {
          id: identifier,
          method: IdentifierType.KERI,
          displayName: state.displayNameValue,
          createdAtUTC: new Date().toISOString(),
          // @TODO - sdisalvo: Colors will need to be removed
          colors: ["#000000", "#000000"],
          theme: state.selectedTheme,
          isPending: state.threshold >= 2,
        };
        dispatch(setIdentifiersCache([...identifiersData, newIdentifier]));
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
    setOtherIdentifierContacts(
      state.selectedConnections.sort(function (a, b) {
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
                identifierCreationStage: 2,
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
              <IonIcon
                aria-hidden="true"
                icon={pencilOutline}
                slot="end"
                onClick={() =>
                  setState((prevState: IdentifierStageProps) => ({
                    ...prevState,
                    identifierCreationStage: 0,
                  }))
                }
              />
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
                      src={connection?.logo ?? CardanoLogo}
                      className="connection-logo"
                      alt="connection-logo"
                    />
                    <span className="connection-name">{connection.label}</span>
                    <IonIcon
                      aria-hidden="true"
                      icon={pencilOutline}
                      slot="end"
                      onClick={() =>
                        setState((prevState: IdentifierStageProps) => ({
                          ...prevState,
                          identifierCreationStage: 1,
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
              <IonLabel>{state.threshold}</IonLabel>
              <IonIcon
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

export { IdentifierStage3 };
