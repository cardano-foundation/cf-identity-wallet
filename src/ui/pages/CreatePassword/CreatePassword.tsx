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
  isModal,
  handleClear,
  setPasswordIsSet,
  userAction,
}: CreatePasswordProps) => {
  const pageId = "create-password";
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const ionRouter = useAppIonRouter();
  const passwordModuleRef = useRef<PasswordModuleRef>(null);

  const handleContinue = async (skipped: boolean) => {
    if (isModal) {
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
  const handleCancel = () => {
    passwordModuleRef.current?.clearState;
    handleClear();
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          currentPath={isModal ? undefined : RoutePath.CREATE_PASSWORD}
          progressBar={!isModal}
          progressBarValue={0.4}
          progressBarBuffer={1}
          closeButton={isModal}
          closeButtonAction={handleCancel}
          closeButtonLabel={`${i18n.t("createpassword.cancel")}`}
          title={
            isModal
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
        isModal={isModal}
        title={isModal ? undefined : `${i18n.t("createpassword.title")}`}
        description={`${i18n.t("createpassword.description")}`}
        onCreateSuccess={handleContinue}
      />
    </ScrollablePageLayout>
  );
};

export { CreatePassword };
