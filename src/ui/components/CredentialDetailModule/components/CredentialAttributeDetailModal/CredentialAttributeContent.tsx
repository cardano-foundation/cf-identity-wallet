import { JSONObject } from "../../../../../core/agent/services/credentialService.types"
import { i18n } from "../../../../../i18n"
import { CardBlock, CardDetailsExpandAttributes, CardDetailsItem } from "../../../CardDetails"
import { ListHeader } from "../../../ListHeader"
import { CredentialAttributeContentProps } from "./CredentialAttributeDetailModal.types"

const IGNORE_KEYS = ["i", "dt", "d"];

const CredentialAttributeContent = ({ data }: CredentialAttributeContentProps) => {
  return (
    <>
      <ListHeader
        title={i18n.t("tabs.credentials.details.attributes.details")}
      />
      <CardBlock title={i18n.t("tabs.credentials.details.attributes.issuee")}>
        <CardDetailsItem
          info={`${data.a.i.substring(0, 5)}...${data.a.i.slice(-5)}`}
          testId="issuer"
        />
      </CardBlock>
      <CardBlock>
        <CardDetailsExpandAttributes data={data.a as JSONObject} ignoreKeys={IGNORE_KEYS}/>
      </CardBlock>
    </>
  )
}

export { CredentialAttributeContent }
