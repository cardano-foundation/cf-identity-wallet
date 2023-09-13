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
import { ConnectModalProps } from "./ConnectModal.types";
import "./ConnectModal.scss";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { operationState } from "../../constants/dictionary";

const ConnectModal = ({
  type,
  ConnectModalIsOpen,
  setConnectModalIsOpen,
}: ConnectModalProps) => {
  const dispatch = useAppDispatch();
  return (
    <IonModal
      isOpen={ConnectModalIsOpen}
      initialBreakpoint={0.3}
      breakpoints={[0, 0.3]}
      className="page-layout short-modal"
      data-testid="add-connection-modal"
      onDidDismiss={() => setConnectModalIsOpen(false)}
    >
      <div className="add-connection-modal modal">
        <PageLayout
          header={true}
          closeButton={false}
          title={`${i18n.t("connectmodal.title") + type}`}
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
                    dispatch(
                      setCurrentOperation(operationState.scanConnection)
                    );
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
                    {i18n.t("connectmodal.scan")}
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
                    {i18n.t("connectmodal.provide")}
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

export { ConnectModal };
