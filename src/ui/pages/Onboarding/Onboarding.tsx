import { IonButton } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";
import { PASSCODE_ROUTE } from "../../../routes";

const Onboarding = () => {
  const items: SlideItem[] = [];
  for (let i = 0; i < 5; i++) {
    items.push({
      title: i18n.t(`onboarding.slides.${i}.title`),
      description: i18n.t(`onboarding.slides.${i}.description`),
      image: "https://placehold.co/290x290",
    });
  }

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
        routerLink={PASSCODE_ROUTE}
        className="ion-primary-button next-button"
      >
        {i18n.t("onboarding.getstarted.button.label")}
      </IonButton>
      <div className="already-wallet">
        {i18n.t("onboarding.alreadywallet.button.label")}
      </div>
    </PageLayout>
  );
};

export { Onboarding };
