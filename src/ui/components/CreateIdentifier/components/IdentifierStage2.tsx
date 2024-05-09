import {
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
} from "@ionic/react";
import { useState } from "react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { ConnectionShortDetails } from "../../../pages/Connections/Connections.types";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";

const IdentifierStage2 = ({
  state,
  setState,
  componentId,
}: IdentifierStageProps) => {
  const [selectedConnections, setSelectedConnections] = useState<
    ConnectionShortDetails[]
  >(state.scannedConections);

  const handleSelectConnection = (connection: ConnectionShortDetails) => {
    let data = selectedConnections;
    if (data.find((item) => item === connection)) {
      data = data.filter((item) => item !== connection);
    } else {
      data = [...selectedConnections, connection];
    }
    setSelectedConnections(data);
  };

  const handleContinue = () => {
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      identifierCreationStage: 3,
      selectedConnections: selectedConnections,
    }));
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => {
              setState((prevState: IdentifierStageProps) => ({
                ...prevState,
                identifierCreationStage: 1,
                selectedConnections: [],
              }));
            }}
            closeButtonLabel={`${i18n.t("createidentifier.back")}`}
            title={`${i18n.t("createidentifier.connections.title")}`}
          />
        }
      >
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.connections.subtitle")}
        </p>
        <IonList>
          {state.scannedConections.map((connection, index) => {
            return (
              <IonItem
                key={index}
                onClick={() => handleSelectConnection(connection)}
                className={`${
                  selectedConnections.includes(connection) &&
                  "selected-connection"
                }`}
              >
                <IonLabel className="connection-item">
                  <img
                    src={connection?.logo || KeriLogo}
                    className="connection-logo"
                    data-testid="identifier-stage-2-logo"
                    alt="connection-logo"
                  />
                  <span className="connection-name">{connection.label}</span>
                  <IonCheckbox
                    checked={selectedConnections.includes(connection)}
                    data-testid={`connection-checkbox-${index}`}
                    onIonChange={() => handleSelectConnection(connection)}
                    aria-label={`connection-checkbox-${index}`}
                  />
                </IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        primaryButtonText={`${i18n.t("createidentifier.connections.continue")}`}
        primaryButtonAction={() => handleContinue()}
        primaryButtonDisabled={!selectedConnections.length}
      />
    </>
  );
};

export { IdentifierStage2 };
