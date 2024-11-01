import { IonButton, IonIcon } from "@ionic/react";
import { star, refreshOutline } from "ionicons/icons";
import { CardBlock, CardDetailsItem, FlatBorderType } from "../../../../components/CardDetails";
import { ListProps } from "./IdentifierDetailModal.types";
import { i18n } from "../../../../../i18n";
import { ListHeader } from "../../../../components/ListHeader";

const List = ({ data, title, bottomText, fullText, mask, rotateAction }: ListProps) => {
  
  return (
    <>
      <ListHeader title={title} />
      {rotateAction && <CardBlock flatBorder={FlatBorderType.BOT} >
        <IonButton
          shape="round"
          className="rotate-keys-button"
          data-testid="rotate-key-button"
          onClick={rotateAction}
        >
          <p>{i18n.t("tabs.identifiers.details.identifierdetail.signingkey.rotate")}</p>
          <IonIcon icon={refreshOutline} />
        </IonButton>
      </CardBlock>}
      <CardBlock flatBorder={rotateAction && FlatBorderType.TOP} className="list-item">
        {data.map((item) => {
          return (
            <CardDetailsItem
              key={item.title}
              info={item.title}
              customIcon={item.image}
              className="member"
              testId={`group-member-${item.title}`}
              mask={mask}
              fullText={fullText}
              endSlot={
                item.isCurrentUser && <div className="user-label">
                  <IonIcon icon={star}/>
                  <span>{i18n.t("tabs.identifiers.details.detailmodal.you")}</span>
                </div>
              }
            />
          );
        })}
        <p className="bottom-text">{bottomText}</p>
      </CardBlock>
    </>
  )
}

export { List };