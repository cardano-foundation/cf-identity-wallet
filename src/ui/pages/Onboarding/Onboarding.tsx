import { useHistory } from "react-router-dom";
import { IonButton, IonPage } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";
import { ROUTES } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getState, setCurrentRoute } from "../../../store/reducers/StateCache";
import { getNextRoute } from "../../../routes/NextRoute";

const Onboarding = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
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
    const { nextPath } = getNextRoute(ROUTES.ONBOARDING_ROUTE, storeState);

    if (nextPath.canNavigate) {
      dispatch(setCurrentRoute({ path: nextPath.pathname }));
      history.push(nextPath.pathname);
    }
  };

  return (
    <IonPage className="page-layout onboarding">
      <PageLayout>
        <Slides items={items} />
        <IonButton
          shape="round"
          expand="block"
          className="ion-primary-button get-started-button"
          onClick={() => {
            handleNavigation();
          }}
          data-testid="get-started-button"
        >
          {i18n.t("onboarding.getstarted.button.label")}
        </IonButton>
        <div className="already-wallet">
          {i18n.t("onboarding.alreadywallet.button.label")}
        </div>
      </PageLayout>
    </IonPage>
  );
};

export { Onboarding };
