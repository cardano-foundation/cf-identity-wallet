import { IonButton } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";

const BUTTON_LABEL = "Get Started";
const ALREADY_WALLET_LABEL = "I already have a wallet";

const Onboarding = () => {
  const slides = i18n.t("onboarding.slides", {
    returnObjects: true,
  }) as SlideItem[];

  const ITEMS = [
    {
      title: slides[0].title,
      description: slides[0].description,
      image: "https://placehold.co/290x290",
    },
    {
      title: slides[1].title,
      description: slides[1].description,
      image: "https://placehold.co/290x290",
    },
    {
      title: slides[2].title,
      description: slides[2].description,
      image: "https://placehold.co/290x290",
    },
    {
      title: slides[3].title,
      description: slides[3].description,
      image: "https://placehold.co/290x290",
    },
    {
      title: slides[4].title,
      description: slides[4].description,
      image: "https://placehold.co/290x290",
    },
  ];

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

export { Onboarding, BUTTON_LABEL, ALREADY_WALLET_LABEL };
