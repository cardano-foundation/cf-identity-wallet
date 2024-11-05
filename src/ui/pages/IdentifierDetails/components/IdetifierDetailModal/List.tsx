import { IonIcon } from "@ionic/react";
import { star } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { CardBlock, CardDetailsItem } from "../../../../components/CardDetails";
import { ListHeader } from "../../../../components/ListHeader";
import { ListProps } from "./IdentifierDetailModal.types";

const List = ({ data, title, bottomText, fullText, mask }: ListProps) => {
  
  return (
    <>
      <ListHeader title={title} />
      <CardBlock className="list-item">
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
