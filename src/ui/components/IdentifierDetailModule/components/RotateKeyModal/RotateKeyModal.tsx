import { IonModal } from "@ionic/react";
import { refreshOutline } from "ionicons/icons";
import { useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { i18n } from "../../../../../i18n";
import { useAppDispatch } from "../../../../../store/hooks";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import {
  CardDetailsBlock,
  CardDetailsItem,
} from "../../../../components/CardDetails";
import { InfoCard } from "../../../../components/InfoCard";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { Spinner } from "../../../../components/Spinner";
import { Verification } from "../../../../components/Verification";
import { ToastMsgType } from "../../../../globals/types";
import "./RotateKeyModal.scss";
import { RotateKeyModalProps } from "./RotateKeyModal.types";

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
      <IonModal
        className="rotate-keys-modal"
        onDidDismiss={onClose}
        isOpen={isOpen}
        data-testid="rotate-keys"
      >
        <ScrollablePageLayout 
          header={
            <PageHeader 
              closeButton
              closeButtonLabel={`${i18n.t("tabs.identifiers.details.rotatekeys.done")}`}
              closeButtonAction={onClose}
              title={`${i18n.t("tabs.identifiers.details.options.rotatekeys")}`}
            />
          }
          footer={
            <PageFooter
              customClass="rotate-key-footer"
              pageId="rotate-key"
              primaryButtonIcon={refreshOutline}
              primaryButtonText={`${i18n.t("tabs.identifiers.details.options.rotatekeys")}`}
              primaryButtonAction={handleRotateKey}
              primaryButtonDisabled={loading}
            />
          }
        >
          <p className="description">
            {i18n.t("tabs.identifiers.details.rotatekeys.description")}
          </p>
          <InfoCard content={i18n.t("tabs.identifiers.details.rotatekeys.message")}/>
          <CardDetailsBlock
            title={i18n.t("tabs.identifiers.details.rotatekeys.signingkey")}
          >
            <CardDetailsItem
              info={signingKey}
              copyButton={true}
              testId={"signing-key"}
            />
            <Spinner show={loading} />
          </CardDetailsBlock>
        </ScrollablePageLayout>
      </IonModal>
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleAfterVerify}
      />
    </>
  );
};

export { RotateKeyModal };
