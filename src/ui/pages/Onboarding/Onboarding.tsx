import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import "./Onboarding.scss";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { RoutePath } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import introImg0 from "../../assets/lottie/wallet.json";
import introImg1 from "../../assets/images/intro-1.png";
import introImg2 from "../../assets/images/intro-2.png";
import introImg3 from "../../assets/images/intro-3.png";
import introImg4 from "../../assets/images/intro-4.png";
import PageFooter from "../../components/PageFooter/PageFooter";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";

export type IntroImg0Type = typeof introImg0;

const Onboarding = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const items: SlideItem[] = [
    {
      title: i18n.t("onboarding.slides.0.title"),
      description: i18n.t("onboarding.slides.0.description"),
      image: "",
      lottie: introImg0,
    },
    {
      title: i18n.t("onboarding.slides.1.title"),
      description: i18n.t("onboarding.slides.1.description"),
      image: introImg1,
    },
    {
      title: i18n.t("onboarding.slides.2.title"),
      description: i18n.t("onboarding.slides.2.description"),
      image: introImg2,
    },
    {
      title: i18n.t("onboarding.slides.3.title"),
      description: i18n.t("onboarding.slides.3.description"),
      image: introImg3,
    },
    {
      title: i18n.t("onboarding.slides.4.title"),
      description: i18n.t("onboarding.slides.4.description"),
      image: introImg4,
    },
  ];

  const handleNavigation = (route?: string) => {
    if (route) {
      // @TODO - sdisalvo: Remove this condition and default to dispatch when the restore route is ready
      return;
    }
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(RoutePath.ONBOARDING, data);
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push({
      pathname: nextPath.pathname,
      state: data.state,
    });
  };

  return (
    <ResponsivePageLayout title={"onboarding"}>
      <Slides items={items} />
      <PageFooter
        pageId={"onboarding"}
        primaryButtonText={`${i18n.t("onboarding.getstarted.button.label")}`}
        primaryButtonAction={() => handleNavigation()}
        tertiaryButtonText={`${i18n.t(
          "onboarding.alreadywallet.button.label"
        )}`}
        // TODO: set restore route when available
        tertiaryButtonAction={() => handleNavigation("#")}
      />
    </ResponsivePageLayout>
  );
};

export { Onboarding };
