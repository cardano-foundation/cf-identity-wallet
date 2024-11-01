import { i18n } from "../../../../../i18n";
import { CardBlock, CardDetailsItem } from "../../../../components/CardDetails";
import { ListHeader } from "../../../../components/ListHeader";
import { IdentifierIDDetailProps } from "./IdentifierDetailModal.types";

const IdentifierIDDetail = ({id}: IdentifierIDDetailProps) => {
  return <>
    <ListHeader title={i18n.t("tabs.identifiers.details.detailmodal.id.proptitle")} />
    <CardBlock>
      <CardDetailsItem info={id} copyButton={true} />
    </CardBlock>
  </>
}

export { IdentifierIDDetail };