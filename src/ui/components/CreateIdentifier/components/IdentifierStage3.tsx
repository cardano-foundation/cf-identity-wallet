import { IonButton, IonIcon } from "@ionic/react";
import { addOutline, removeOutline } from "ionicons/icons";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";

const IdentifierStage3 = ({
  state,
  setState,
  componentId,
}: IdentifierStageProps) => {
  const updateThreshold = (amount: number) => {
    const newThreshold = state.threshold + amount;

    if (
      newThreshold < 1 ||
      newThreshold > state.selectedConnections.length + 1
    ) {
      return;
    }

    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      threshold: newThreshold,
    }));
  };

  const handleContinue = () => {
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      identifierCreationStage: 4,
    }));
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("createidentifier.back")}`}
            closeButtonAction={() => {
              setState((prevState: IdentifierStageProps) => ({
                ...prevState,
                threshold: 1,
                identifierCreationStage: 2,
              }));
            }}
            title={`${i18n.t("createidentifier.threshold.title")}`}
          />
        }
      >
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.threshold.subtitle")}
        </p>
        <div className="identifier-threshold">
          <div className="identifier-threshold-title">
            {i18n.t("createidentifier.threshold.label")}
          </div>
          <div className="identifier-threshold-items">
            <div className="identifier-threshold-amount">{state.threshold}</div>
            <div className="identifier-threshold-controls">
              <IonButton
                shape="round"
                className="decrease-threshold-button"
                data-testid="decrease-threshold-button"
                onClick={() => updateThreshold(-1)}
              >
                <IonIcon
                  slot="icon-only"
                  icon={removeOutline}
                  color="primary"
                />
              </IonButton>
              <IonButton
                shape="round"
                className="increase-threshold-button"
                data-testid="increase-threshold-button"
                onClick={() => updateThreshold(1)}
              >
                <IonIcon
                  slot="icon-only"
                  icon={addOutline}
                  color="primary"
                />
              </IonButton>
            </div>
          </div>
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        primaryButtonText={`${i18n.t("createidentifier.threshold.continue")}`}
        primaryButtonAction={() => handleContinue()}
      />
    </>
  );
};

export { IdentifierStage3 };
