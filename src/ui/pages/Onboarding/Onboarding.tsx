import { useHistory } from "react-router-dom";
import { IonButton, IonPage } from "@ionic/react";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { PageLayout } from "../../components/layout/PageLayout";
import { RoutePath } from "../../../routes";
import { useAppDispatch } from "../../../store/hooks";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";

const Onboarding = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const items: SlideItem[] = [];
  for (let i = 0; i < 5; i++) {
    items.push({
      title: i18n.t(`onboarding.slides.${i}.title`),
      description: i18n.t(`onboarding.slides.${i}.description`),
      image: "https://placehold.co/290x290",
    });
  }

  const handleNavigation = () => {
    const data: DataProps = {};
    const { nextPath, updateRedux } = getNextRoute(RoutePath.ONBOARDING, data);
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push({
      pathname: nextPath.pathname,
      state: {
        type: "new",
      },
    });
  };

  return (
    <IonPage className="page-layout onboarding safe-area">
      <PageLayout currentPath={RoutePath.ONBOARDING}>
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
