import { IonItem, IonLabel, IonList, IonModal } from "@ionic/react";
import { i18n } from "../../../../../i18n";
import { BackEventPriorityType } from "../../../../globals/types";
import { ScrollablePageLayout } from "../../../layout/ScrollablePageLayout";
import { PageHeader } from "../../../PageHeader";
import { SymbolModalProps, Symbols } from "./SymbolModal.type";
import "./SymbolModal.scss";

const SymbolModal = ({ isOpen, setOpen }: SymbolModalProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <IonModal
      isOpen={isOpen}
      className="symbol-modal"
      data-testid="symbol-modal"
      onDidDismiss={handleClose}
    >
      <ScrollablePageLayout
        pageId="symbol-modal-content"
        activeStatus={isOpen}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("createpassword.symbolmodal.done")}`}
            closeButtonAction={handleClose}
            title={`${i18n.t("createpassword.symbolmodal.title")}`}
            hardwareBackButtonConfig={{
              prevent: false,
              priority: BackEventPriorityType.Modal,
            }}
          />
        }
      >
        <p className="explain">{i18n.t("createpassword.symbolmodal.text")}</p>
        <IonList className="symbol-list">
          <IonItem className="list-header">
            <IonLabel>
              {i18n.t("createpassword.symbolmodal.symbolcolumn")}
            </IonLabel>
            <IonLabel>{i18n.t("createpassword.symbolmodal.name")}</IonLabel>
          </IonItem>
          {Symbols.map(({ key, labelKey }) => (
            <IonItem
              className="list-item"
              key={key}
            >
              <IonLabel className="symbol">{key}</IonLabel>
              <IonLabel className="symbol-name">
                {i18n.t(`createpassword.symbolmodal.listsymbol.${labelKey}`)}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <i>{i18n.t("createpassword.symbolmodal.note")}</i>
      </ScrollablePageLayout>
    </IonModal>
  );
};

export { SymbolModal };
