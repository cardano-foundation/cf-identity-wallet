import {
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { scanCircleOutline, qrCodeOutline } from "ionicons/icons";
import { useState } from "react";
import { JsonEncoder } from "@aries-framework/core";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { ConnectModalProps } from "./ConnectModal.types";
import "./ConnectModal.scss";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { operationState } from "../../constants/dictionary";
import { ShareQR } from "../ShareQR/ShareQR";
import { AriesAgent } from "../../../core/agent/agent";
import { MoreOptions } from "../ShareQR/MoreOptions";

const ConnectModal = ({
  type,
  connectModalIsOpen,
  setConnectModalIsOpen,
}: ConnectModalProps) => {
  const dispatch = useAppDispatch();
  const [invitationLink, setInvitationLink] = useState<string>();

  async function handleProvideQr() {
    const invitationLink =
      await AriesAgent.agent.connections.createMediatorInvitation();
    // @TODO: FOR TESTING, change 10.4.21.37 => to ip
    const shortUrlResponse = await fetch(
      "http://10.4.21.37:3001/shorten?url=" + invitationLink.invitationUrl
    );
    const res = JsonEncoder.fromString(await shortUrlResponse.text());
    setInvitationLink(res.data);
  }

  return (
    <IonModal
      isOpen={connectModalIsOpen}
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
                  onClick={handleProvideQr}
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
          {invitationLink && (
            <ShareQR
              isOpen={!!invitationLink}
              setIsOpen={() => setInvitationLink(undefined)}
              header={{
                title: i18n.t("connectmodal.connect"),
                titlePosition: "center",
              }}
              content={{
                QRData: invitationLink,
              }}
              moreComponent={<MoreOptions text={""} />}
              modalOptions={{
                initialBreakpoint: 0.65,
                breakpoints: [0, 0.65],
              }}
            />
          )}
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { ConnectModal };
