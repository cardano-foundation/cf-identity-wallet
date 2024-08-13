import { IonButton, IonIcon } from "@ionic/react";
import { refreshOutline } from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../../../i18n";
import {
  CardDetailsBlock,
  CardDetailsItem,
} from "../../../../components/CardDetails";
import { OptionModal } from "../../../../components/OptionsModal";
import { RotateKeyModalProps } from "./RotateKeyModal.types";
import "./RotateKeyModal.scss";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../../../store/hooks";
import { Spinner } from "../../../../components/Spinner";
import { Agent } from "../../../../../core/agent/agent";
import { ToastMsgType } from "../../../../globals/types";
import { Verification } from "../../../../components/Verification";

const RotateKeyModal = ({
  isOpen,
  signingKey,
  identifierId,
  onClose,
  onReloadData,
}: RotateKeyModalProps) => {
  const dispatch = useAppDispatch();
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRotateKey = () => {
    setVerifyIsOpen(true);
  };

  const handleAfterVerify = async () => {
    setLoading(true);

    try {
      await Agent.agent.identifiers.rotateIdentifier(identifierId);
      await onReloadData();
      dispatch(setToastMsg(ToastMsgType.ROTATE_KEY_SUCCESS));
    } catch (e) {
      dispatch(setToastMsg(ToastMsgType.ROTATE_KEY_ERROR));
    } finally {
      setLoading(false);
    }
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
          className="primary-button rotate-button"
          data-testid="rotate-key-button"
          onClick={handleRotateKey}
        >
          <IonIcon
            slot="start"
            icon={refreshOutline}
          />
          {i18n.t("identifiers.details.options.rotatekeys")}
        </IonButton>
      </OptionModal>
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleAfterVerify}
      />
    </>
  );
};

export { RotateKeyModal };
