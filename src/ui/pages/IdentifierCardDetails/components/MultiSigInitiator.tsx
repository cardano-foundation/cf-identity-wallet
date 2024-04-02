import { useEffect, useState } from "react";
import {
  IonButton,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonList,
  IonRow,
} from "@ionic/react";
import { KERIDetails } from "../../../../core/agent/services/singleSig.types";
import { Agent } from "../../../../core/agent/agent";
import {
  CardDetailsBlock,
  CardDetailsItem,
} from "../../../components/CardDetailsElements";

const MultiSigInitiator = ({ cardData }: { cardData: KERIDetails }) => {
  const [oobi, setOobi] = useState("");
  const [firstUrl, setFirstUrl] = useState("");
  const [secondUrl, setSecondUrl] = useState("");

  useEffect(() => {
    if (cardData) {
      const fetchOobi = async () => {
        const oobiValue = await Agent.agent.connections.getKeriOobi(
          `${cardData.signifyName}`
        );
        if (oobiValue) {
          setOobi(oobiValue);
        }
      };
      fetchOobi();
    }
  }, [cardData]);

  const saveFirst = (ev: Event) => {
    setFirstUrl((ev.target as HTMLInputElement).value);
  };
  const saveSecond = (ev: Event) => {
    setSecondUrl((ev.target as HTMLInputElement).value);
  };
  const handleSubmit = async (url: string) => {
    await Agent.agent.connections.receiveInvitationFromUrl(url);
  };

  return (
    <>
      <CardDetailsBlock title="OOBI">
        <CardDetailsItem
          info={oobi}
          copyButton={true}
        />
      </CardDetailsBlock>
      <CardDetailsBlock title="Contacts">
        <IonList className="multi-sig-contact-list">
          <IonItem>
            <IonGrid>
              <IonRow>
                <IonCol size="10">
                  <IonInput
                    label="First contact"
                    labelPlacement="stacked"
                    fill="outline"
                    placeholder="Enter text"
                    onIonInput={(event) => saveFirst(event)}
                  />
                </IonCol>
                <IonCol>
                  <IonButton
                    size="small"
                    onClick={async () => handleSubmit(firstUrl)}
                  >
                    Submit
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonItem>
            <IonGrid>
              <IonRow>
                <IonCol size="10">
                  <IonInput
                    label="Second contact"
                    labelPlacement="stacked"
                    fill="outline"
                    placeholder="Enter text"
                    onIonInput={(event) => saveSecond(event)}
                  />
                </IonCol>
                <IonCol>
                  <IonButton
                    size="small"
                    onClick={async () => handleSubmit(secondUrl)}
                  >
                    Submit
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
        </IonList>
      </CardDetailsBlock>
    </>
  );
};

export { MultiSigInitiator };
