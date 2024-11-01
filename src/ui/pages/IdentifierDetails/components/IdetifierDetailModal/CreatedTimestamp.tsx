import { IonIcon } from "@ionic/react";
import {
  calendarNumberOutline,
} from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { CardBlock, CardDetailsItem } from "../../../../components/CardDetails";
import { ListHeader } from "../../../../components/ListHeader";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import { CreatedTimestampProps } from "./IdentifierDetailModal.types";

const CreatedTimestamp = ({createdTime}: CreatedTimestampProps) => {
  return <>
    <ListHeader title={i18n.t("tabs.identifiers.details.detailmodal.created.createdtimestamp.title")} />
    <CardBlock className="datetime-block">
      <CardDetailsItem 
        keyValue={formatShortDate(createdTime)}
        info={formatTimeToSec(createdTime)} 
        endSlot={
          <IonIcon slot="end" icon={calendarNumberOutline} className="icon"/>
        }
      />
    </CardBlock>
  </>
}

export { CreatedTimestamp };
