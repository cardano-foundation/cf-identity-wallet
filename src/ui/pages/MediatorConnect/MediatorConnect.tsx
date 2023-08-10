import { useHistory } from "react-router-dom";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage, IonTextarea,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import "./MediatorConnect.scss";
import { PageLayout } from "../../components/layout/PageLayout";
import { RoutePath } from "../../../routes";
import {useState} from "react";

const MediatorConnect = () => {
  const [externalAgent, setExternalAgent] = useState("");
  const [mediatorAgent, setMediatorAgent] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");

  const connectAgents = () => {
    // Lógica de conexión - Esto es solo un ejemplo
    const result = `Conectado con External: ${externalAgent} y Mediator: ${mediatorAgent}`;
    setConsoleOutput(result);
  };

  return (
    <IonPage className="page-mediator-connect onboarding safe-area">
      <PageLayout currentPath={RoutePath.MEDIATOR_CONNECT}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Conexion de Agentes</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem>
          <IonLabel position="floating">Agente Externo</IonLabel>
          <IonInput value={externalAgent} onIonChange={e => setExternalAgent(e.detail.value!)}></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Agente Mediator</IonLabel>
          <IonInput value={mediatorAgent} onIonChange={e => setMediatorAgent(e.detail.value!)}></IonInput>
        </IonItem>
        <IonButton expand="block" onClick={connectAgents}>Conectar</IonButton>
        <IonTextarea value={consoleOutput} readonly></IonTextarea>
      </PageLayout>
    </IonPage>
  );
};

export { MediatorConnect };
