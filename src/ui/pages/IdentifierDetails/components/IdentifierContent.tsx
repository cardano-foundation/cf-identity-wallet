import { IonButton, IonIcon } from "@ionic/react";
import {
  calendarNumberOutline,
  keyOutline,
  refreshOutline
} from "ionicons/icons";
import { useMemo } from "react";
import { i18n } from "../../../../i18n";
import { useAppSelector } from "../../../../store/hooks";
import { getMultisigConnectionsCache } from "../../../../store/reducers/connectionsCache";
import { getIdentifiersCache } from "../../../../store/reducers/identifiersCache";
import { getAuthentication } from "../../../../store/reducers/stateCache";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { CardDetailsContent } from "../../../components/CardDetails";
import { CardBlock, FlatBorderType } from "../../../components/CardDetails/CardDetailsBlock";
import { CardDetailsItem } from "../../../components/CardDetails/CardDetailsItem";
import { ListHeader } from "../../../components/ListHeader";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { IdentifierContentProps } from "./IdentifierContent.types";
import { DetailView } from "./IdetifierDetailModal/IdentifierDetailModal.types";

const DISPLAY_MEMBERS = 3;

const IdentifierContent = ({
  cardData,
  openPropDetailModal,
}: IdentifierContentProps) => {
  const identifiersData = useAppSelector(getIdentifiersCache);
  const userName = useAppSelector(getAuthentication)?.userName;
  const multisignConnectionsCache = useAppSelector(getMultisigConnectionsCache);
  const memberCount = cardData.members?.length || 0;
  
  const isMultiSig = useMemo(() => {
    const identifier = identifiersData.find((data) => data.id === cardData.id);

    return cardData.multisigManageAid || (identifier && identifier.multisigManageAid);
  }, [cardData.id, cardData.multisigManageAid, identifiersData])


  const members = useMemo(() => {
    return cardData.members?.map((member) => {
      const memberConnection = multisignConnectionsCache[member];
      let name = memberConnection?.label || member;

      if (!memberConnection?.label) {
        name = userName;
      }

      return name;
    }).slice(0, DISPLAY_MEMBERS);
  }, [cardData.members, multisignConnectionsCache, userName]);


  const openSigningKeyDetail = () => openPropDetailModal(DetailView.SigningKey);
  const openRotationKeyDigests = () => openPropDetailModal(DetailView.RotationKeyDigests);
  const openSigningKey = () => openPropDetailModal(DetailView.SigningKey);
  const openGroupMember = () => openPropDetailModal(DetailView.GroupMember);

  return (
    <>
      {isMultiSig && members && (
        <>
          <ListHeader title={i18n.t("tabs.identifiers.details.group.title")}/>
          <CardBlock
            onClick={openGroupMember}
            title={i18n.t("tabs.identifiers.details.group.groupmembers.title")}
          >
            {members.map((item, index) => {
              return (
                <CardDetailsItem
                  key={index}
                  info={item}
                  customIcon={KeriLogo}
                  className="member"
                  testId={`group-member-${index}`}
                />
              );
            })}
            {
              members.length < memberCount && <IonButton className="view-more-members" onClick={() => openPropDetailModal(DetailView.GroupMember)} data-testid="view-member">{
                i18n.t("tabs.identifiers.details.group.button.viewmore", {
                  remainMembers: memberCount - DISPLAY_MEMBERS
                })
              }</IonButton>
            }
          </CardBlock>
          {cardData.kt && (
            <CardBlock title={i18n.t("tabs.identifiers.details.group.signingkeysthreshold.title")} onClick={() => openPropDetailModal(DetailView.SigningThreshold)}>
              <CardDetailsContent 
                mainContent={`${cardData.kt}`}
                subContent={`${i18n.t("tabs.identifiers.details.group.signingkeysthreshold.outof", { threshold: memberCount })}`}
              />
            </CardBlock>
          )}
        </>
      )}
      <ListHeader title={i18n.t("tabs.identifiers.details.identifierdetail.title")}/>
      <div className="identifier-detail-section">
        <CardBlock title={i18n.t("tabs.identifiers.details.identifierdetail.identifierid.title")} onClick={() => openPropDetailModal(DetailView.Id)}>
          <CardDetailsItem
            info={cardData.id.substring(0, 5) + "..." + cardData.id.slice(-5)}
            icon={keyOutline}
            testId="identifier"
            className="identifier"
            mask={false}
          />
        </CardBlock>
        <CardBlock title={i18n.t("tabs.identifiers.details.identifierdetail.created.title")}  onClick={() => openPropDetailModal(DetailView.Created)}>
          <CardDetailsItem
            keyValue={formatShortDate(cardData.createdAtUTC)}
            info={formatTimeToSec(cardData.createdAtUTC)}
            icon={calendarNumberOutline}
            testId="creation-timestamp"
            className="creation-timestamp"
            mask={false}
            fullText
          />
        </CardBlock>
      </div>
      {!isMultiSig && cardData.k.length && (
        <>
          <CardBlock onClick={openSigningKey} flatBorder={FlatBorderType.BOT} title={i18n.t("tabs.identifiers.details.identifierdetail.signingkey.title")} >
            {cardData.k.map((item, index) => {
              return (
                <CardDetailsItem
                  key={item}
                  info={item.substring(0, 5) + "..." + item.slice(-5)}
                  testId={`signing-key-${index}`}
                  icon={keyOutline}
                  mask={false}
                  fullText={false}
                />
              );
            })}
          </CardBlock>
          <CardBlock flatBorder={FlatBorderType.TOP} >
            <IonButton
              shape="round"
              className="rotate-keys-button"
              data-testid="rotate-keys-button"
              onClick={openSigningKey}
            >
              <p>{i18n.t("tabs.identifiers.details.identifierdetail.signingkey.rotate")}</p>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </CardBlock>
        </>
      )}
      {isMultiSig && cardData.k.length && (
        <CardBlock title={i18n.t("tabs.identifiers.details.identifierdetail.signingkey.multisigtitle", { singingKeys: cardData.k.length })} onClick={openSigningKeyDetail}/>
      )}
      <ListHeader title={i18n.t("tabs.identifiers.details.keyrotation.title")}/>
      {isMultiSig && cardData.kt && (
        <CardBlock title={i18n.t("tabs.identifiers.details.keyrotation.rotatesigningkey.title")} onClick={() => openPropDetailModal(DetailView.RotationThreshold)}>
          <CardDetailsContent 
            testId="rotate-signing-key"
            mainContent={`${cardData.kt}`}
            subContent={`${i18n.t("tabs.identifiers.details.keyrotation.rotatesigningkey.outof", { threshold: memberCount })}`}
          />
        </CardBlock>
      )}
      {cardData.s && (
        <CardBlock title={i18n.t("tabs.identifiers.details.keyrotation.sequencenumber.title")} onClick={() => openPropDetailModal(DetailView.SequenceNumber)}>
          <CardDetailsContent 
            testId="sequence-number"
            mainContent={cardData.s}
            subContent={`${i18n.t("tabs.identifiers.details.keyrotation.sequencenumber.lastrotate")}: ${formatShortDate(cardData.dt) + " - " + formatTimeToSec(cardData.dt)}`}
          />
        </CardBlock>
      )}
      {!isMultiSig && cardData.n.length && (
        <CardBlock
          onClick={openRotationKeyDigests}
          title={i18n.t("tabs.identifiers.details.keyrotation.nextkeyslist.title")}
        >
          {cardData.n.map((item, index) => {
            return (
              <CardDetailsItem
                key={item}
                info={item.substring(0, 5) + "..." + item.slice(-5)}
                icon={keyOutline}
                testId={`next-key-${index}`}
                mask={false}
                fullText={false}
              />
            );
          })}
        </CardBlock>
      )}
      {isMultiSig && cardData.n.length && (
        <CardBlock title={i18n.t("tabs.identifiers.details.keyrotation.nextkeyslist.showkey", { rotationKeys: cardData.n.length })} onClick={openRotationKeyDigests}/>
      )}
    </>
  );
};

export { IdentifierContent };
