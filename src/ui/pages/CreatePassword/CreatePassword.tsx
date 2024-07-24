import { useRef } from "react";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { getNextRoute } from "../../../routes/nextRoute";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { PageHeader } from "../../components/PageHeader";
import { PasswordModule } from "../../components/PasswordModule";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { OperationType } from "../../globals/types";
import { useAppIonRouter } from "../../hooks";
import "./CreatePassword.scss";
import { PasswordModuleRef } from "../../components/PasswordModule/PasswordModule.types";

const CreatePassword = () => {
  const pageId = "create-password";
  const stateCache = useAppSelector(getStateCache);
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();

  const passwordModuleRef = useRef<PasswordModuleRef>(null);

  const handleContinue = async (skipped: boolean) => {
    const { nextPath, updateRedux } = getNextRoute(RoutePath.CREATE_PASSWORD, {
      store: { stateCache },
      state: { skipped },
    });

    updateReduxState(
      nextPath.pathname,
      {
        store: { stateCache },
        state: { skipped },
      },
      dispatch,
      updateRedux
    );
    dispatch(setCurrentOperation(OperationType.IDLE));
    ionRouter.push(nextPath.pathname, "forward", "push");
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          currentPath={RoutePath.CREATE_PASSWORD}
          progressBar={true}
          progressBarValue={0.4}
          progressBarBuffer={1}
        />
      }
    >
      <PasswordModule
        ref={passwordModuleRef}
        testId={pageId}
        title={`${i18n.t("createpassword.title")}`}
        description={`${i18n.t("createpassword.description")}`}
        onCreateSuccess={handleContinue}
      />
    </ScrollablePageLayout>
  );
};

export { CreatePassword };
