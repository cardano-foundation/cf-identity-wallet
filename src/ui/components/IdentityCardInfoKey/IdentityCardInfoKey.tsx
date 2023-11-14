import {
  keyOutline,
  calendarNumberOutline,
  pricetagOutline,
  personCircleOutline,
} from "ionicons/icons";
import { formatShortDate } from "../../../utils";
import { IdentityCardInfoKeyProps } from "./IdentityCardInfoKey.types";
import { CardDetailsBlock, CardDetailsItem } from "../CardDetailsElements";

const IdentityCardInfoKey = ({ cardData }: IdentityCardInfoKeyProps) => {
  return (
    <>
      <CardDetailsBlock title="identity.card.details.information">
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
      <CardDetailsBlock title="identity.card.details.type">
        <CardDetailsItem
          info={cardData.keyType}
          copyButton={true}
          icon={pricetagOutline}
          testId="copy-button-type"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title="identity.card.details.controller">
        <CardDetailsItem
          info={cardData.controller}
          copyButton={true}
          icon={personCircleOutline}
          testId="copy-button-controller"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title="identity.card.details.publickeybase">
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

export { IdentityCardInfoKey };
