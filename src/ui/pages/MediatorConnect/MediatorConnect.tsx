
import {
  IonButton, IonCol,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel, IonList,
  IonPage, IonRow, IonTextarea,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import "./MediatorConnect.scss";
import { PageLayout } from "../../components/layout/PageLayout";
import { RoutePath } from "../../../routes";
import {useState} from "react";
import {AriesAgent} from "../../../core/aries/ariesAgent";

const MediatorConnect = () => {
  const [agent, setAgent] = useState(undefined);
  const [externalAgent, setExternalAgent] = useState("");
  const [mediatorAgent, setMediatorAgent] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [connected, setIsConnected] = useState(false);

  const connectAgents = async () => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}\t | `;

    if (mediatorAgent.length) {
      /*
      const newAgent = AriesAgent.agentWithMediator(mediatorAgent);
      newAgent.start().then(() => {
        const result = `${formattedTime} Connected to mediator: ${mediatorAgent}`;
        setConsoleOutput(prev => [result, ...prev]);
        setIsConnected(true);
      }).catch(e => {
        console.log("error:");
        console.log(e);
        setConsoleOutput(prev => [`${formattedTime} ❌ Error on agent start`, ...prev]);
      });*/
    } else {
      setConsoleOutput(prev => [`${formattedTime} ❌ Mediator invitation link not set`, ...prev]);
    }
  };

  const sendMessage = () => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()} >> `;

    if (connected){
      setConsoleOutput(prev => [`${formattedTime} Message sent: ${messageToSend}`, ...prev]);
      setMessageToSend("");
    } else {
      setConsoleOutput(prev => [`${formattedTime} ❌ Not connected yet`, ...prev]);
    }
  };

  return (
    <IonPage className="page-mediator-connect onboarding safe-area">
      <PageLayout currentPath={RoutePath.MEDIATOR_CONNECT}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Agents Connect E2E</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem>
          <IonLabel position="floating">Mediator (Agent) - {connected ? "Is Connected" : "Not Connected"}</IonLabel>
          <IonInput value={mediatorAgent} onIonChange={e => setMediatorAgent(e.detail.value!)}></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Faber Invitation Link</IonLabel>
          <IonInput value={externalAgent} onIonChange={e => setExternalAgent(e.detail.value!)}></IonInput>
        </IonItem>
        <IonButton expand="block" onClick={connectAgents}>Connect</IonButton>
        <IonRow>
          <IonCol size="9">
            <IonTextarea
                className="message-container"
                value={messageToSend}
                onIonChange={e => setMessageToSend(e.detail.value!)}
                placeholder="Message..">
            </IonTextarea>
          </IonCol>
          <IonCol size="3">
            <IonButton expand="block" onClick={sendMessage}>Enviar</IonButton>
          </IonCol>
        </IonRow>
        <IonList>
          {consoleOutput.map((log, index) => (
              <IonItem key={index}>
                {log}
              </IonItem>
          ))}
        </IonList>
      </PageLayout>
    </IonPage>
  );
};

export { MediatorConnect };
