import { useState } from "react";
import { useHistory , useLocation } from "react-router-dom";
import "./TunnelConnect.scss";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading } from "@ionic/react";
import { qrCodeOutline } from "ionicons/icons";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../store/hooks";
import { RoutePath } from "../../../routes";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../components/PageHeader";
import { AriesAgent } from "../../../core/agent/agent";

interface LocationState {
  oobiUrl?: string;
}

const TunnelConnect = () => {
  const pageId = "tunnel-connect";
  const history = useHistory();
  const location = useLocation<LocationState>();
  const dispatch = useAppDispatch();
  const state = location.state;

  const [inputValue, setInputValue] = useState(state?.oobiUrl || "");
  const [showLoading, setShowLoading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const handleScanOOBI = () => {
    dispatch(setCurrentRoute({ path: RoutePath.OOBI_SCANNER }));
    history.push(RoutePath.OOBI_SCANNER);
  };

  const handleResolveOOBI = async () => {
    setShowLoading(true);
    // TODO: Validate oobi url
    if (!inputValue) {
      alert("Invalid OOBI URL format");
      return;
    }

    const operation = await AriesAgent.agent.connections.resolveOObi(
      inputValue
    );

    // TODO: store operation in Preferences

    setUrls((currentUrls) => [...currentUrls, inputValue]);
    setLogs((currentLogs) => [...currentLogs, `URL added: ${inputValue}`]);
    setInputValue("");
    setShowLoading(false);
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          title="Tunnel Connect"
          backButton={true}
          currentPath={RoutePath.TUNNEL_CONNECT}
        />
      }
    >
      <div className="oobi-input">
        <IonInput
          value={inputValue}
          onIonChange={(e) => setInputValue(e.detail.value!)}
          placeholder="Insert OOBI URL"
          clearInput
        />
        <IonButton onClick={handleScanOOBI}>
          <IonIcon
            icon={qrCodeOutline}
            color="light"
          />
        </IonButton>
        <IonButton
          onClick={handleResolveOOBI}
          disabled={!inputValue.length}
        >
          Resolve OOBI
          <IonLoading
            isOpen={showLoading}
            message={"Resolving OOBI"}
            duration={5000}
          />
        </IonButton>
      </div>

      <IonList>
        <IonItem lines="none">
          <IonLabel>
            <strong>Resolved OOBIs</strong>
          </IonLabel>
        </IonItem>
        {urls.map((url, index) => (
          <IonItem key={index}>{url}</IonItem>
        ))}
      </IonList>

      <IonList>
        <IonItem lines="none">
          <IonLabel>
            <strong>Logs</strong>
          </IonLabel>
        </IonItem>
        {logs.map((log, index) => (
          <IonItem key={index}>{log}</IonItem>
        ))}
      </IonList>
    </ScrollablePageLayout>
  );
};

export { TunnelConnect };
