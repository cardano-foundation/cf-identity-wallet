import { useHistory } from "react-router-dom";
import { IonButton, IonPage } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";
import { RoutePath } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setOnboardingRoute,
} from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { onboardingRoute } from "../../constants/dictionary";

const Onboarding = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const items: SlideItem[] = [];
  for (let i = 0; i < 5; i++) {
    items.push({
      title: i18n.t(`onboarding.slides.${i}.title`),
      description: i18n.t(`onboarding.slides.${i}.description`),
      image: "https://placehold.co/290x290",
    });
  }

  const handleNavigation = (route: string) => {
    if (route === onboardingRoute.restore) {
      // @TODO - sdisalvo: Remove this condition and default to dispatch when the restore route is ready
      return;
    } else {
      dispatch(setOnboardingRoute(route));
      const data: DataProps = {
        store: { stateCache },
        state: { onboardingRoute: route },
      };
      const { nextPath, updateRedux } = getNextRoute(
        RoutePath.ONBOARDING,
        data
      );
      updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
      history.push({
        pathname: nextPath.pathname,
        state: data.state,
      });
    }
  };

  return (
    <IonPage className="page-layout onboarding safe-area">
      <PageLayout
        currentPath={RoutePath.ONBOARDING}
        footer={true}
        primaryButtonText={`${i18n.t("onboarding.getstarted.button.label")}`}
        primaryButtonAction={() => handleNavigation(onboardingRoute.create)}
        secondaryButtonText={`${i18n.t(
          "onboarding.alreadywallet.button.label"
        )}`}
        secondaryButtonAction={() => handleNavigation(onboardingRoute.restore)}
      >
        <Slides items={items} />
      </PageLayout>
    </IonPage>
  );
};

export { Onboarding };
