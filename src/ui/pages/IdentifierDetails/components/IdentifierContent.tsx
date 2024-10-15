import {
  calendarNumberOutline,
  keyOutline,
  personCircleOutline,
  refreshOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { IdentifierContentProps } from "./IdentifierContent.types";
import { i18n } from "../../../../i18n";
import { ConfigurationService } from "../../../../core/configuration";
import { CardDetailsBlock } from "../../../components/CardDetails/CardDetailsBlock";
import { CardDetailsItem } from "../../../components/CardDetails/CardDetailsItem";
import { BackingMode } from "../../../../core/configuration/configurationService.types";
import { useAppSelector } from "../../../../store/hooks";
import { getIdentifiersCache } from "../../../../store/reducers/identifiersCache";

const IdentifierContent = ({
  cardData,
  onOpenRotateKey,
}: IdentifierContentProps) => {
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [isMultiSig, setIsMultiSig] = useState(false);

  useEffect(() => {
    if (cardData.multisigManageAid) {
      setIsMultiSig(true);
      return;
    }

    const identifier = identifiersData.find((data) => data.id === cardData.id);
    if (identifier && identifier.multisigManageAid) {
      setIsMultiSig(true);
    }
  }, [identifiersData, cardData.id, cardData.multisigManageAid]);

  const RotateActionButton = () => {
    return (
      <IonButton
        slot="end"
        shape="round"
        className="rotate-keys-button"
        data-testid={"rotate-keys-button"}
        onClick={onOpenRotateKey}
      >
        <h4>{i18n.t("tabs.identifiers.details.signingkeyslist.rotate")}</h4>
        <IonIcon icon={refreshOutline} />
      </IonButton>
    );
  };

  return (
    <>
      <CardDetailsBlock
        title={i18n.t("tabs.identifiers.details.information.title")}
      >
        <CardDetailsItem
          info={cardData.id}
          copyButton={true}
          icon={keyOutline}
          testId="identifier"
        />
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
      {cardData.k.length && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.signingkeyslist.title")}
          action={isMultiSig ? undefined : <RotateActionButton />}
        >
          {cardData.k.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                testId={`signing-key-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.n.length && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.nextkeyslist.title")}
        >
          {cardData.n.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                testId={`next-key-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}
      {cardData.s && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.sequencenumber.title")}
        >
          <CardDetailsItem
            info={`${cardData.s}`}
            copyButton={false}
            testId="sequence-number"
          />
        </CardDetailsBlock>
      )}
      {cardData.dt && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.rotationtimestamp.title")}
        >
          <CardDetailsItem
            info={
              formatShortDate(cardData.dt) +
              " - " +
              formatTimeToSec(cardData.dt)
            }
            copyButton={false}
            testId="rotation-timestamp"
          />
        </CardDetailsBlock>
      )}

      {cardData.di !== "" && cardData.di && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.delegator.title")}
        >
          <CardDetailsItem
            info={cardData.di}
            copyButton={true}
            testId="delegator"
          />
        </CardDetailsBlock>
      )}

      {typeof cardData.kt === "string" && Number(cardData.kt) > 1 && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.signingkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.kt}`}
            copyButton={false}
            testId="signing-keys-threshold"
          />
        </CardDetailsBlock>
      )}

      {typeof cardData.nt === "string" && Number(cardData.nt) > 1 && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.nextkeysthreshold.title")}
        >
          <CardDetailsItem
            info={`${cardData.nt}`}
            copyButton={false}
            testId="next-keys-threshold"
          />
        </CardDetailsBlock>
      )}

      {cardData.b.length > 0 && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.backerslist.title")}
        >
          {cardData.b.map((item, index) => {
            return (
              <CardDetailsItem
                key={index}
                info={item}
                copyButton={true}
                testId={`backer-${index}`}
              />
            );
          })}
        </CardDetailsBlock>
      )}

      {/* @TODO - foconnor: We should verify the particular identifier is ledger based, not that our config is. */}
      {ConfigurationService.env.keri.backing.mode === BackingMode.LEDGER && (
        <CardDetailsBlock
          title={i18n.t("tabs.identifiers.details.backeraddress.title")}
        >
          <CardDetailsItem
            info={ConfigurationService.env.keri.backing.ledger.address}
            copyButton={true}
            icon={personCircleOutline}
            // @TODO - foconnor: This metadata in the future should come with Signify, for now we are "assuming" the address.
            testId="backer-address"
          />
        </CardDetailsBlock>
      )}
    </>
  );
};

export { IdentifierContent };
