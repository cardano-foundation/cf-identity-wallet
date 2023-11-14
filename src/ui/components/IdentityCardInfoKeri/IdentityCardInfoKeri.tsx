import { calendarNumberOutline, personCircleOutline } from "ionicons/icons";
import { formatShortDate, formatTimeToSec } from "../../../utils";
import { IdentityCardInfoKeriProps } from "./IdentityCardInfoKeri.types";
import { SignifyApi } from "../../../core/agent/modules/signify/signifyApi";
import { CardDetailsBlock, CardDetailsItem } from "../CardDetailsElements";

const IdentityCardInfoKeri = ({ cardData }: IdentityCardInfoKeriProps) => {
  return (
    <>
      {cardData.di !== "" && (
        <CardDetailsBlock title="identity.card.details.delegator.title">
          <CardDetailsItem
            info={cardData.di}
            copyButton={true}
            textIcon="identity.card.details.delegator.icon"
            testId="delegator-copy-button"
          />
        </CardDetailsBlock>
      )}
      {cardData.k.length && (
        <CardDetailsBlock title="identity.card.details.signingkeyslist.title">
          {cardData.k.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identity.card.details.signingkeyslist.icon"
                testId={`signing-keys-list-copy-button-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.kt > 1 && (
        <CardDetailsBlock title="identity.card.details.signingkeysthreshold.title">
          <CardDetailsItem
            info={`${cardData.kt}`}
            copyButton={false}
            textIcon="identity.card.details.signingkeysthreshold.icon"
            testId="signing-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      {cardData.n.length && (
        <CardDetailsBlock title="identity.card.details.nextkeyslist.title">
          {cardData.n.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identity.card.details.nextkeyslist.icon"
                testId={`next-keys-list-copy-button-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.nt > 1 && (
        <CardDetailsBlock title="identity.card.details.nextkeysthreshold.title">
          <CardDetailsItem
            info={`${cardData.nt}`}
            copyButton={false}
            textIcon="identity.card.details.nextkeysthreshold.icon"
            testId="next-keys-threshold"
          />
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title="identity.card.details.creationtimestamp.title">
        <CardDetailsItem
          info={
            formatShortDate(cardData.createdAtUTC) +
            " - " +
            formatTimeToSec(cardData.createdAtUTC)
          }
          copyButton={false}
          icon={calendarNumberOutline}
          testId="creation-timestamp"
        />
      </CardDetailsBlock>
      {cardData.s > 0 && cardData.dt && (
        <CardDetailsBlock title="identity.card.details.rotationtimestamp.title">
          <CardDetailsItem
            info={
              formatShortDate(cardData.dt) +
              " - " +
              formatTimeToSec(cardData.dt)
            }
            copyButton={false}
            textIcon="identity.card.details.rotationtimestamp.icon"
            testId="rotation-timestamp"
          />
        </CardDetailsBlock>
      )}
      {cardData.s > 0 && (
        <CardDetailsBlock title="identity.card.details.sequencenumber.title">
          <CardDetailsItem
            info={`${cardData.s}`}
            copyButton={true}
            textIcon="identity.card.details.sequencenumber.icon"
            testId="sequence-number"
          />
        </CardDetailsBlock>
      )}
      {cardData.b.length && (
        <CardDetailsBlock title="identity.card.details.backerslist.title">
          {cardData.b.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                textIcon="identity.card.details.backerslist.icon"
                testId={`backers-list-copy-button-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title="identity.card.details.backeraddress.title">
        <CardDetailsItem
          info={SignifyApi.BACKER_ADDRESS}
          copyButton={true}
          icon={personCircleOutline}
          // @TODO - foconnor: This metadata in the future should come with Signify, for now we are "assuming" the address.
          testId="copy-button-backer-address"
        />
      </CardDetailsBlock>
    </>
  );
};

export { IdentityCardInfoKeri };
