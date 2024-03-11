import {
  keyOutline,
  calendarNumberOutline,
  pricetagOutline,
  personCircleOutline,
} from "ionicons/icons";
import { formatShortDate } from "../../utils/formatters";
import { IdentifierCardInfoDidProps } from "./IdentifierCardInfoKey.types";
import { CardDetailsInfoBlock, CardDetailsItem } from "../CardDetailsElements";
import { i18n } from "../../../i18n";

const IdentifierCardInfoDid = ({ cardData }: IdentifierCardInfoDidProps) => {
  return (
    <>
      <CardDetailsInfoBlock
        title={i18n.t("identifiers.card.details.information")}
      >
        <CardDetailsItem
          info={cardData.id}
          copyButton={true}
          icon={keyOutline}
          testId="copy-button-id"
        />
        <CardDetailsItem
          info={formatShortDate(cardData?.createdAtUTC)}
          copyButton={false}
          icon={calendarNumberOutline}
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock title={i18n.t("identifiers.card.details.type")}>
        <CardDetailsItem
          info={cardData.keyType}
          copyButton={true}
          icon={pricetagOutline}
          testId="copy-button-type"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock
        title={i18n.t("identifiers.card.details.controller")}
      >
        <CardDetailsItem
          info={cardData.controller}
          copyButton={true}
          icon={personCircleOutline}
          testId="copy-button-controller"
        />
      </CardDetailsInfoBlock>
      <CardDetailsInfoBlock
        title={i18n.t("identifiers.card.details.publickeybase")}
      >
        <CardDetailsItem
          info={cardData.publicKeyBase58}
          copyButton={true}
          icon={keyOutline}
          testId="copy-button-publicKeyBase58"
        />
      </CardDetailsInfoBlock>
    </>
  );
};

export { IdentifierCardInfoDid };
