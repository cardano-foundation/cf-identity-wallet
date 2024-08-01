import { useRef } from "react";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { getNextRoute } from "../../../routes/nextRoute";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { PageHeader } from "../../components/PageHeader";
import { PasswordModule } from "../../components/PasswordModule";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { OperationType, ToastMsgType } from "../../globals/types";
import { useAppIonRouter } from "../../hooks";
import "./CreatePassword.scss";
import { PasswordModuleRef } from "../../components/PasswordModule/PasswordModule.types";
import { CreatePasswordProps } from "./CreatePassword.types";

const CreatePassword = ({
  handleClear,
  setPasswordIsSet,
  userAction,
}: CreatePasswordProps) => {
  const pageId = "create-password";
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const ionRouter = useAppIonRouter();
  const passwordModuleRef = useRef<PasswordModuleRef>(null);
  const isOnboarding = stateCache.routes[0].path === RoutePath.CREATE_PASSWORD;

  const handleContinue = async (skipped: boolean) => {
    if (!isOnboarding) {
      setPasswordIsSet(true);
      userAction?.current === "change" &&
        dispatch(setToastMsg(ToastMsgType.PASSWORD_UPDATED));
      userAction?.current === "enable" &&
        dispatch(setToastMsg(ToastMsgType.PASSWORD_CREATED));
      handleClear();
    } else {
      const { nextPath, updateRedux } = getNextRoute(
        RoutePath.CREATE_PASSWORD,
        {
          store: { stateCache },
          state: { skipped },
        }
      );

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
    }
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          currentPath={isOnboarding ? RoutePath.CREATE_PASSWORD : undefined}
          progressBar={isOnboarding}
          progressBarValue={0.4}
          progressBarBuffer={1}
          closeButton={!isOnboarding}
          closeButtonAction={handleClear}
          closeButtonLabel={`${i18n.t("createpassword.cancel")}`}
          title={
            !isOnboarding
              ? `${i18n.t(
                userAction?.current === "change"
                  ? "createpassword.change"
                  : "createpassword.title"
              )}`
              : undefined
          }
        />
      }
    >
      <PasswordModule
        ref={passwordModuleRef}
        testId={pageId}
        isOnboarding={isOnboarding}
        title={isOnboarding ? `${i18n.t("createpassword.title")}` : undefined}
        description={`${i18n.t("createpassword.description")}`}
        onCreateSuccess={handleContinue}
      />
    </ScrollablePageLayout>
  );
};

export { CreatePassword };
