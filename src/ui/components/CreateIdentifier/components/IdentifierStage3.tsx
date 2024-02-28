import { IonCard, IonItem, IonLabel, IonIcon } from "@ionic/react";
import { pencilOutline } from "ionicons/icons";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import CardanoLogo from "../../../assets/images/CardanoLogo.jpg";

const IdentifierStage3 = ({
  state,
  setState,
  componentId,
  resetModal,
}: IdentifierStageProps) => {
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
                multiSigStage: 2,
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
                    multiSigStage: 0,
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
            {state.selectedConnections.map((connection, index) => {
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
                  </IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    icon={pencilOutline}
                    slot="end"
                    onClick={() =>
                      setState((prevState: IdentifierStageProps) => ({
                        ...prevState,
                        multiSigStage: 1,
                      }))
                    }
                  />
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
                    multiSigStage: 2,
                  }))
                }
              />
            </IonItem>
          </IonCard>
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        primaryButtonText={`${i18n.t("createidentifier.confirm.continue")}`}
        primaryButtonAction={() => {
          resetModal();
          alert("Transmit data");
        }}
      />
    </>
  );
};

export { IdentifierStage3 };
