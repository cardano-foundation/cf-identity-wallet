import {
  keyOutline,
  calendarNumberOutline,
  pricetagOutline,
} from "ionicons/icons";
import { formatShortDate } from "../../utils/formatters";
import { IdentifierCardInfoDidProps } from "./IdentifierCardInfoKey.types";
import { CardDetailsBlock, CardDetailsItem } from "../CardDetailsElements";
import { i18n } from "../../../i18n";

const IdentifierCardInfoDid = ({ cardData }: IdentifierCardInfoDidProps) => {
  return (
    <>
      <CardDetailsBlock title={i18n.t("identifiers.card.details.information")}>
        <CardDetailsItem
          info={cardData.id}
          copyButton={true}
          icon={keyOutline}
          testId="information"
        />
        <CardDetailsItem
          info={formatShortDate(cardData?.createdAtUTC)}
          copyButton={false}
          icon={calendarNumberOutline}
          testId="information-date"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title={i18n.t("identifiers.card.details.type")}>
        <CardDetailsItem
          info={cardData.keyType}
          copyButton={true}
          icon={pricetagOutline}
          testId="type"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        title={i18n.t("identifiers.card.details.publickeybase")}
      >
        <CardDetailsItem
          info={cardData.publicKeyBase58}
          copyButton={true}
          icon={keyOutline}
          testId="publickeybase58"
        />
      </CardDetailsBlock>
    </>
  );
};

export { IdentifierCardInfoDid };
