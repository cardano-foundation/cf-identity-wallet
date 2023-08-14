
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
import {useEffect, useState} from "react";
import {AriesAgent} from "../../../core/aries/ariesAgent";

const MediatorConnect = () => {
  const [invitationLink, setInvitationLink] = useState( localStorage.getItem('invitationLink') || '');
  const [mediatorAgent, setMediatorAgent] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [messageToSend, setMessageToSend] = useState("");
  const [connected, setIsConnected] = useState(false);

  useEffect(() => {
    document.addEventListener("aries-agent-connected", () => {
      console.log("AriesAgent.ready connected!!");
      const currentTime = new Date();
      const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}\t | `;
      setConsoleOutput(prev => [`${formattedTime} Id-Wallet agent ready: ${AriesAgent.ready}`, ...prev]);
      setIsConnected(true);
    });
  }, []);

  const connectAgents = async () => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}\t | `;

    if (mediatorAgent.length) {

    } else {
      setConsoleOutput(prev => [`${formattedTime} ❌ Mediator invitation link not set`, ...prev]);
    }
  };

  const sendMessage = async () => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()} >> `;

    if (connected){
      await AriesAgent.agent.sendMessage(messageToSend);
      setConsoleOutput(prev => [`${formattedTime} 💬 Message sent: ${messageToSend}`, ...prev]);
      setMessageToSend("");
    } else {
      setConsoleOutput(prev => [`${formattedTime} ❌ Not connected yet`, ...prev]);
    }
  };

  const handleSetInvitationLink = (invLink: string) => {
    setInvitationLink(invLink);
    localStorage.setItem('invitationLink', invLink);
  }

  return (
    <IonPage className="page-mediator-connect onboarding safe-area">
      <PageLayout currentPath={RoutePath.MEDIATOR_CONNECT}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Agents Connect E2E</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem>
          <IonLabel position="floating">Mediator (Agent) - {connected ? "Is Connected ✅" : "Not Connected ❌"}</IonLabel>
          <IonInput value={mediatorAgent} onIonChange={e => setMediatorAgent(e.detail.value!)}></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Faber Invitation Link</IonLabel>
          <IonInput value={invitationLink} onIonChange={e => handleSetInvitationLink(e.detail.value!)}></IonInput>
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
