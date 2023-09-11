import { useEffect, useState } from "react";
import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";
import { i18n } from "../../../i18n";
import "./ConnectionRequest.scss";
import {
  getConnectionRequest,
  setConnectionRequest,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

const ConnectionRequest = () => {
  const dispatch = useAppDispatch();
  const connectionRequest = useAppSelector(getConnectionRequest);
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);

  useEffect(() => {
    setShowConnectionRequest(!!connectionRequest.length);
  }, [connectionRequest]);

  const handleConnect = async () => {
    await AriesAgent.agent.receiveInvitationFromUrl(connectionRequest);
  };

  return (
    <IonPage
      className={`page-layout connection-request safe-area ${
        showConnectionRequest ? "show" : "hide"
      }`}
      data-testid="connection-request"
    >
      <PageLayout
        header={true}
        title={`${i18n.t("connect.title")}`}
        footer={true}
        primaryButtonText={`${i18n.t("connectionrequest.button.connect")}`}
        primaryButtonAction={handleConnect}
        secondaryButtonText={`${i18n.t("connectionrequest.button.cancel")}`}
        secondaryButtonAction={() => {
          dispatch(setConnectionRequest(""));
          setShowConnectionRequest(false);
        }}
      >
        x
      </PageLayout>
    </IonPage>
  );
};

export { ConnectionRequest };
