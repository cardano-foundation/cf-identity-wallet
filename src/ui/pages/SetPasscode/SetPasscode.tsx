import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { BiometryError } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { useRef, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { RoutePath } from "../../../routes";
import { getNextRoute } from "../../../routes/nextRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setEnableBiometryCache } from "../../../store/reducers/biometryCache";
import { getStateCache, setToastMsg } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { CreatePasscodeModule } from "../../components/CreatePasscodeModule";
import { PageHeader } from "../../components/PageHeader";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { ToastMsgType } from "../../globals/types";
import { useAppIonRouter } from "../../hooks";
import { useBiometricAuth } from "../../hooks/useBiometricsHook";
import "./SetPasscode.scss";
import { CreatePasscodeModuleRef } from "../../components/CreatePasscodeModule/CreatePasscodeModule.types";
import { i18n } from "../../../i18n";

const SetPasscode = () => {
  const pageId = "set-passcode";
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const [passCodeValue, setPassCodeValue] = useState({
    passcode: "",
    originalPasscode: "",
  });

  const ref = useRef<CreatePasscodeModuleRef>(null);

  const handlePassAuth = async () => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.SET_PASSCODE,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    ionRouter.push(nextPath.pathname, "forward", "push");
    ref.current?.clearState();

    await Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_ALREADY_INIT,
        content: { initialized: true },
      })
    );
  };

  const isOnReenterPasscodeStep =
    passCodeValue.originalPasscode.length > 0 &&
    passCodeValue.passcode.length < 6;

  const title =
    passCodeValue.originalPasscode !== ""
      ? i18n.t("setpasscode.reenterpasscode.title")
      : i18n.t("setpasscode.enterpasscode.title");

  return (
    <ResponsivePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          onBack={isOnReenterPasscodeStep ? ref.current?.clearState : undefined}
          beforeBack={ref.current?.clearState}
          currentPath={RoutePath.SET_PASSCODE}
          progressBar={true}
          progressBarValue={0.25}
          progressBarBuffer={1}
        />
      }
    >
      <CreatePasscodeModule
        title={title}
        description={`${i18n.t("setpasscode.enterpasscode.description")}`}
        ref={ref}
        testId={pageId}
        onCreateSuccess={handlePassAuth}
        onPasscodeChange={(passcode, originalPasscode) => {
          setPassCodeValue({
            passcode,
            originalPasscode,
          });
        }}
      />
    </ResponsivePageLayout>
  );
};

export { SetPasscode };
