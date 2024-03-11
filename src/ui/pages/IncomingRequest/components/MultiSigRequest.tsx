import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import { CardDetailsInfoBlock } from "../../../components/CardDetailsElements/CardDetailsInfoBlock";

const MultiSigRequest = ({
  pageId,
  requestData,
  handleAccept,
  handleCancel,
}: RequestProps) => {
  return (
    <>
      <p className="request-subtitle">{i18n.t("request.multisig.subtitle")}</p>
      <CardDetailsInfoBlock title={i18n.t("request.multisig.requestfrom")}>
        <div>X</div>
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("request.multisig.othermembers")}>
        <div>X</div>
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("request.multisig.threshold")}>
        <div>1</div>
      </CardDetailsInfoBlock>
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t("request.button.accept")}`}
        primaryButtonAction={() => handleAccept()}
        secondaryButtonText={`${i18n.t("request.button.decline")}`}
        secondaryButtonAction={() => handleCancel()}
      />
    </>
  );
};

export { MultiSigRequest };
