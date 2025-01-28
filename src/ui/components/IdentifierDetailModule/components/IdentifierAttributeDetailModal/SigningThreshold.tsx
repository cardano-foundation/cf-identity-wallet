import { i18n } from "../../../../../i18n";
import { CardBlock, CardDetailsItem } from "../../../../components/CardDetails";
import { ListHeader } from "../../../../components/ListHeader";
import { SigningThresholdProps } from "./IdentifierAttributeDetailModal.types";

export const SigningThreshold = ({ data }: SigningThresholdProps) => {
  return (
    <>
      <ListHeader
        title={i18n.t(
          "tabs.identifiers.details.detailmodal.signingthreshold.threshold.title"
        )}
      />
      <CardBlock testId="signing-threshold-block">
        <CardDetailsItem
          info={i18n.t(
            "tabs.identifiers.details.detailmodal.signingthreshold.threshold.text",
            {
              members: data.members?.length || 0,
              threshold: data.kt,
            }
          )}
        />
      </CardBlock>
    </>
  );
};
