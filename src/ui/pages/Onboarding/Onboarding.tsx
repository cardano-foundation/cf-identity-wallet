import { useHistory } from "react-router-dom";
import { IonButton } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";
import {
  SET_PASSCODE_ROUTE,
  GENERATE_SEED_PHRASE_ROUTE,
  ROUTES,
} from "../../../routes";
import { store } from "../../../store";
import { useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getState,
} from "../../../store/reducers/StateCache";
import {getNextPath} from "../../../routes/Rules";

const Onboarding = ({}) => {
  const history = useHistory();
  const storeState = useAppSelector(getState);
  const items: SlideItem[] = [];
  for (let i = 0; i < 5; i++) {
    items.push({
      title: i18n.t(`onboarding.slides.${i}.title`),
      description: i18n.t(`onboarding.slides.${i}.description`),
      image: "https://placehold.co/290x290",
    });
  }

  const handleNavigation = () => {
    const { nextPath } = getNextPath(ROUTES.ONBOARDING_ROUTE, storeState);

    if (nextPath.canNavigate) {
      history.push(nextPath.pathname);
    }
  };

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
        onClick={() => {
          handleNavigation();
        }}
        className="ion-primary-button next-button"
        data-testid="get-started-button"
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
