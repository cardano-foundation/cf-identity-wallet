import { IonButton, IonIcon } from "@ionic/react";
import { refreshOutline } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { CardDetailsBlock, CardDetailsItem } from "../../../CardDetails";
import { OptionModal } from "../../../OptionsModal";
import { RotateKeyModalProps } from "./RotateKeyModal.types";
import "./RotateKeyModal.scss";
import { VerifyPasscode } from "../../../VerifyPasscode";
import { VerifyPassword } from "../../../VerifyPassword";
import { useState } from "react";
import { getStateCache } from "../../../../../store/reducers/stateCache";
import { useAppSelector } from "../../../../../store/hooks";
import { Spinner } from "../../../Spinner";

const RotateKeyModal = ({
  isOpen,
  signingKey,
  onClose,
  onRotateKeyClick,
}: RotateKeyModalProps) => {
  const stateCache = useAppSelector(getStateCache);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRotateKey = () => {
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const handleAfterVerify = async () => {
    setLoading(true);
    await onRotateKeyClick();
    setLoading(false);
  };

  return (
    <>
      <OptionModal
        customClasses="rotate-keys-modal"
        onDismiss={onClose}
        modalIsOpen={isOpen}
        componentId="rotate-keys"
        header={{
          closeButton: true,
          closeButtonLabel: `${i18n.t("identifiers.details.rotatekeys.done")}`,
          closeButtonAction: () => {
            onClose();
          },
          title: `${i18n.t("identifiers.details.options.rotatekeys")}`,
        }}
      >
        <p className="description">
          {i18n.t("identifiers.details.rotatekeys.description")}
        </p>
        <CardDetailsBlock
          title={i18n.t("identifiers.details.signingkeyslist.title")}
        >
          <CardDetailsItem
            info={signingKey}
            copyButton={true}
            textIcon="identifiers.details.signingkeyslist.icon"
            testId={"signing-key"}
          />
          <Spinner show={loading} />
        </CardDetailsBlock>
        <IonButton
          disabled={loading}
          shape="round"
          expand="block"
          className="primary-button confirm-edit-button"
          data-testid="continue-button"
          onClick={handleRotateKey}
        >
          <IonIcon
            slot="start"
            icon={refreshOutline}
          />
          {i18n.t("identifiers.details.options.rotatekeys")}
        </IonButton>
      </OptionModal>
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={handleAfterVerify}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={handleAfterVerify}
      />
    </>
  );
};

export { RotateKeyModal };
