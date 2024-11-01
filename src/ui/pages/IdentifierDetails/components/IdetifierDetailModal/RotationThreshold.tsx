import { i18n } from "../../../../../i18n"
import { CardBlock, CardDetailsItem } from "../../../../components/CardDetails"
import { ListHeader } from "../../../../components/ListHeader"
import { DetailView, SigningThresholdProps } from "./IdentifierDetailModal.types"

const RotationThreshold = ({ data, setViewType }: SigningThresholdProps) => {
  return (
    <>
      <ListHeader title={i18n.t("tabs.identifiers.details.detailmodal.rotationthreshold.threshold.title")} />
      <CardBlock>
        <CardDetailsItem info={i18n.t("tabs.identifiers.details.detailmodal.rotationthreshold.threshold.text", {
          members: data.members?.length || 0,
          threshold: data.kt
        })}/>
      </CardBlock>
      <ListHeader title={i18n.t("tabs.identifiers.details.detailmodal.rotationthreshold.options.title")} />
      <CardBlock testId={DetailView.GroupMember} onClick={() => setViewType(DetailView.GroupMember)} title={i18n.t("tabs.identifiers.details.detailmodal.rotationthreshold.options.viewmember", {
        members: data.members?.length || 0,
      })}/>
      <CardBlock testId={DetailView.SigningKey} onClick={() => setViewType(DetailView.SigningKey)} title={i18n.t("tabs.identifiers.details.detailmodal.rotationthreshold.options.viewkey", {
        keys: data.k.length
      })}/>
      <CardBlock testId={DetailView.RotationKeyDigests} onClick={() => setViewType(DetailView.RotationKeyDigests)} title={i18n.t("tabs.identifiers.details.detailmodal.rotationthreshold.options.viewrotationkey", {
        keys: data.n.length
      })}/>
    </>
  )
}

export { RotationThreshold }; 