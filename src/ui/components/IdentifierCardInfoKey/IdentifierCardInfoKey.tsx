import {
  keyOutline,
  calendarNumberOutline,
  pricetagOutline,
  personCircleOutline,
} from "ionicons/icons";
import { formatShortDate } from "../../utils/formatters";
import { IdentifierCardInfoDidProps } from "./IdentifierCardInfoKey.types";
import { CardDetailsBlock, CardDetailsItem } from "../CardDetailsElements";

const IdentifierCardInfoDid = ({ cardData }: IdentifierCardInfoDidProps) => {
  return (
    <>
      <CardDetailsBlock title="identifiers.card.details.information">
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
      </CardDetailsBlock>
      <CardDetailsBlock title="identifiers.card.details.type">
        <CardDetailsItem
          info={cardData.keyType}
          copyButton={true}
          icon={pricetagOutline}
          testId="copy-button-type"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title="identifiers.card.details.controller">
        <CardDetailsItem
          info={cardData.controller}
          copyButton={true}
          icon={personCircleOutline}
          testId="copy-button-controller"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title="identifiers.card.details.publickeybase">
        <CardDetailsItem
          info={cardData.publicKeyBase58}
          copyButton={true}
          icon={keyOutline}
          testId="copy-button-publicKeyBase58"
        />
      </CardDetailsBlock>
    </>
  );
};

export { IdentifierCardInfoDid };
