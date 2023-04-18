import { IonButton } from "@ionic/react";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { PageLayout } from "../../components/common/PageLayout";

const ITEMS = [
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

const BUTTON_LABEL = "Get Started";
const ALREADY_WALLET_LABEL = "I already have a wallet";

const Onboarding = () => {
  return (
    <PageLayout
      backButton={false}
      backButtonPath={"/"}
      contentClasses=""
      progressBar={false}
      progressBarValue={0}
      progressBarBuffer={1}
    >
      <Slides items={ITEMS} />
      <IonButton
        routerLink="/setpasscode"
        className="ion-primary-button next-button"
      >
        {BUTTON_LABEL}
      </IonButton>
      <div className="already-wallet">{ALREADY_WALLET_LABEL}</div>
    </PageLayout>
  );
};

export { Onboarding, BUTTON_LABEL, ALREADY_WALLET_LABEL, ITEMS };
