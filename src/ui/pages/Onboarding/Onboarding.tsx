import { IonButton, IonContent, IonPage } from "@ionic/react";

import "./style.scss";
import { Slides } from "../../components/Slides";

const Onboarding = () => {
  const slides = [
    {
      title: "Welcome to your Cardano Foundation Identity Wallet",
      description:
        "A secure and easy-to-use tool that allows you to manage your digital identity and control your personal data",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Securerly manage your digital identity",
      description:
        "Securely manage your digital identity and share your personal data with confidence",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Take control of your personal data",
      description:
        "Say goodbye to the days of handing over your personal data to third-party companies",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Verify your identity with ease",
      description:
        "Verify your identity for various online services, without sharing unnecessary personal information",
      image: "https://placehold.co/290x290",
    },
    {
      title: "Experience the power of decentralized identity",
      description:
        "As a decentralized identity platform, you take control of your digital identity and your personal data",
      image: "https://placehold.co/290x290",
    },
  ];

  return (
    <>
      <IonPage>
        <IonContent>
          <Slides slides={slides} />
          <IonButton
            className="next-button"
            onClick={() => {}}
          >
            Get Started
          </IonButton>
          <div className="already-wallet">I already have a wallet</div>
        </IonContent>
      </IonPage>
    </>
  );
};

export { Onboarding };
