import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { getNextRoute } from "../../../routes/nextRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import introImg1 from "../../assets/images/intro-1.png";
import introImg2 from "../../assets/images/intro-2.png";
import introImg3 from "../../assets/images/intro-3.png";
import introImg4 from "../../assets/images/intro-4.png";
import introImg0 from "../../assets/lottie/wallet.json";
import { PageFooter } from "../../components/PageFooter";
import { Slides } from "../../components/Slides";
import { SlideItem } from "../../components/Slides/Slides.types";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { useExitAppWithDoubleTap } from "../../hooks/useExitAppWithDoubleTap";
import "./Onboarding.scss";

export type IntroImg0Type = typeof introImg0;

const Onboarding = () => {
  const pageId = "onboarding";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const [hiddenPage, setHiddenPage] = useState(false);
  useExitAppWithDoubleTap(hiddenPage);

  useEffect(() => {
    setHiddenPage(history?.location?.pathname !== RoutePath.ONBOARDING);
  }, [hiddenPage, history?.location?.pathname]);

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

  const handleNavigation = (op?: string) => {
    const data: DataProps = {
      store: { stateCache },
      state: {
        recoveryWalletProgress: !!op,
      },
    };
    const { nextPath, updateRedux } = getNextRoute(RoutePath.ONBOARDING, data);
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);

    if (op) {
      Agent.agent.basicStorage.createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.APP_RECOVERY_WALLET,
          content: {
            value: String(!!op),
          },
        })
      );
    }

    history.push({
      pathname: nextPath.pathname,
      state: data.state,
    });
  };

  if (hiddenPage) return null;

  return (
    <ResponsivePageLayout pageId={pageId}>
      <Slides items={items} />
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t("onboarding.getstarted.button.label")}`}
        primaryButtonAction={() => handleNavigation()}
        tertiaryButtonText={`${i18n.t(
          "onboarding.alreadywallet.button.label"
        )}`}
        tertiaryButtonAction={() => handleNavigation("#")}
      />
    </ResponsivePageLayout>
  );
};

export { Onboarding };
