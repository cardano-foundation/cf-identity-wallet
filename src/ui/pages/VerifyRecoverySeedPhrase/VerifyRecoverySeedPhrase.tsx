import { useHistory } from "react-router-dom";
import { useRef } from "react";
import { RoutePath } from "../../../routes";
import { getBackRoute } from "../../../routes/backRoute";
import { getNextRoute } from "../../../routes/nextRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { PageHeader } from "../../components/PageHeader";
import {
  RecoverySeedPhraseModule,
  RecoverySeedPhraseModuleRef,
} from "../../components/RecoverySeedPhraseModule";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { useAppIonRouter } from "../../hooks";
import { i18n } from "../../../i18n";
import "./VerifyRecoverySeedPhrase.scss";

const VerifyRecoverySeedPhrase = () => {
  const pageId = "verify-recovery-seed-phrase";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const ionRouter = useAppIonRouter();

  const ref = useRef<RecoverySeedPhraseModuleRef>(null);

  const handleNavigate = () => {
    const data: DataProps = {
      store: { stateCache },
      state: {
        currentOperation: stateCache.currentOperation,
      },
    };

    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.VERIFY_RECOVERY_SEED_PHRASE,
      data
    );

    ref.current?.clearState();
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);

    ionRouter.push(nextPath.pathname, "root", "replace");
  };

  const handleBack = () => {
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.VERIFY_RECOVERY_SEED_PHRASE,
      {
        store: { stateCache },
      }
    );
    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    ref.current?.clearState();
    history.push({
      pathname: backPath.pathname,
    });
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          onBack={() => {
            handleBack();
          }}
          currentPath={RoutePath.VERIFY_RECOVERY_SEED_PHRASE}
          progressBar={true}
          progressBarValue={0.75}
          progressBarBuffer={1}
        />
      }
    >
      <RecoverySeedPhraseModule
        title={`${i18n.t("verifyrecoveryseedphrase.title")}`}
        description={`${i18n.t("verifyrecoveryseedphrase.paragraph.top")}`}
        ref={ref}
        testId={pageId}
        onVerifySuccess={handleNavigate}
      />
    </ScrollablePageLayout>
  );
};

export { VerifyRecoverySeedPhrase };
