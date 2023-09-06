import {
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { scanCircleOutline, qrCodeOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { AddConnectionProps } from "./AddConnection.types";
import "./AddConnection.scss";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";

const AddConnection = ({
  addConnectionIsOpen,
  setAddConnectionIsOpen,
}: AddConnectionProps) => {
  const dispatch = useAppDispatch();
  return (
    <IonModal
      isOpen={addConnectionIsOpen}
      initialBreakpoint={0.3}
      breakpoints={[0, 0.3]}
      className="page-layout short-modal"
      data-testid="add-connection-modal"
      onDidDismiss={() => setAddConnectionIsOpen(false)}
    >
      <div className="add-connection-modal modal">
        <PageLayout
          header={true}
          closeButton={false}
          title={`${i18n.t("connections.modal.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="add-connection-modal-body"
              >
                <span
                  className="add-connection-modal-option"
                  data-testid="add-connection-modal-scan-qr-code"
                  onClick={() => {
                    dispatch(setCurrentOperation("scan"));
                    setAddConnectionIsOpen(false);
                  }}
                >
                  <span>
                    <IonButton shape="round">
                      <IonIcon
                        slot="icon-only"
                        icon={scanCircleOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="add-connection-modal-label">
                    {i18n.t("connections.modal.scan")}
                  </span>
                </span>
                <span
                  className="add-connection-modal-option"
                  data-testid="add-connection-modal-provide-qr-code"
                >
                  <span>
                    <IonButton shape="round">
                      <IonIcon
                        slot="icon-only"
                        icon={qrCodeOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="add-connection-modal-label">
                    {i18n.t("connections.modal.provide")}
                  </span>
                </span>
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { AddConnection };
