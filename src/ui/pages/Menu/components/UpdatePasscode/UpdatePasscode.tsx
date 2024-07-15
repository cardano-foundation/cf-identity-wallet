import { useEffect, useRef, useState } from "react";
import { IonModal } from "@ionic/react";
import "./UpdatePasscode.scss";
import { CreatePasscodeModuleRef } from "../../../../components/CreatePasscodeModule/CreatePasscodeModule.types";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { CreatePasscodeModule } from "../../../../components/CreatePasscodeModule";
import { i18n } from "../../../../../i18n";
import { UpdatePasscodeModalProps } from "./UpdatePasscode.types";

const UpdatePasscode = ({ isOpen, setIsOpen }: UpdatePasscodeModalProps) => {
  const pageId = "update-passcode";
  const [passCodeValue, setPassCodeValue] = useState({
    passcode: "",
    originalPasscode: "",
  });

  const ref = useRef<CreatePasscodeModuleRef>(null);

  const handlePassAuth = async () => {
    // TODO: toast message and close modal
    setIsOpen(false);
  };

  useEffect(() => {
    console.log(passCodeValue);
    console.log(isOnReenterPasscodeStep);
  }, [passCodeValue]);

  const handleCancel = () => {
    if (isOnReenterPasscodeStep) {
      ref.current?.clearState;
      setPassCodeValue({
        passcode: "",
        originalPasscode: "",
      });
    } else {
      setIsOpen(false);
    }
  };

  const isOnReenterPasscodeStep =
    passCodeValue.originalPasscode.length > 0 &&
    passCodeValue.passcode.length < 6;

  const title =
    passCodeValue.originalPasscode !== ""
      ? i18n.t("settings.updatepasscode.reenterpasscode.title")
      : i18n.t("settings.updatepasscode.createpasscode.title");

  return (
    <IonModal
      isOpen={isOpen}
      className={pageId + "-modal"}
      data-testid={pageId + "-modal"}
      onDidDismiss={() => setIsOpen(false)}
    >
      <ResponsivePageLayout
        pageId={pageId}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${
              isOnReenterPasscodeStep
                ? i18n.t("settings.updatepasscode.back")
                : i18n.t("settings.updatepasscode.cancel")
            }`}
            closeButtonAction={handleCancel}
          />
        }
      >
        <CreatePasscodeModule
          title={title}
          description={`${i18n.t("settings.updatepasscode.description")}`}
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
    </IonModal>
  );
};

export { UpdatePasscode };
