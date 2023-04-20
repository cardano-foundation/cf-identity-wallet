import { IonButton } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";

const Onboarding = () => {
  const items: SlideItem[] = [];
  for (let i = 0; i < 5; i++) {
    items.push({
      title: i18n.t(`onboarding.slides.${i}.title`),
      description: i18n.t(`onboarding.slides.${i}.description`),
      image: "https://placehold.co/290x290",
    });
  }
  const getStartedButtonLabel = i18n.t("onboarding.getstarted.button.label");
  const alreadyWalletButtonLabel = i18n.t(
    "onboarding.alreadywallet.button.label"
  );

  return (
    <PageLayout
      backButton={false}
      backButtonPath={"/"}
      contentClasses=""
      progressBar={false}
      progressBarValue={0}
      progressBarBuffer={1}
    >
      <Slides items={items} />
      <IonButton
        routerLink="/setpasscode"
        className="ion-primary-button next-button"
      >
        {getStartedButtonLabel}
      </IonButton>
      <div className="already-wallet">{alreadyWalletButtonLabel}</div>
    </PageLayout>
  );
};

export { Onboarding };
