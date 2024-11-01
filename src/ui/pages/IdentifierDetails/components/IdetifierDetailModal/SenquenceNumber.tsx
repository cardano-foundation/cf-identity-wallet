import { IonIcon } from "@ionic/react";
import {
  calendarNumberOutline,
} from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { CardBlock, CardDetailsItem } from "../../../../components/CardDetails";
import { ListHeader } from "../../../../components/ListHeader";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import { SenquenceNumberProps } from "./IdentifierDetailModal.types";

const SenquenceNumber = ({ data }: SenquenceNumberProps) => {
  return <>
    <ListHeader title={i18n.t("tabs.identifiers.details.detailmodal.sequencenumber.sequencenumbersection.title")} />
    <CardBlock>
      <CardDetailsItem 
        info={data.s} 
      />
    </CardBlock>
    <ListHeader title={i18n.t("tabs.identifiers.details.detailmodal.sequencenumber.lastrotationtimestamp.title")} />
    <CardBlock className="datetime-block">
      <CardDetailsItem 
        keyValue={formatShortDate(data.dt)}
        info={formatTimeToSec(data.dt)} 
        endSlot={
          <IonIcon slot="end" icon={calendarNumberOutline} className="icon"/>
        }
      />
    </CardBlock>
  </>
}

export { SenquenceNumber };
