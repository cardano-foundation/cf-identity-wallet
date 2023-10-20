import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../../utils";
import { CredCardTemplateProps } from "./CredCardTemplate.types";

const CardBodyUniversity = ({ cardData }: CredCardTemplateProps) => {
  return (
    <div className="card-body">
      <span>
        {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
          <>&nbsp;</>
        ) : (
          <>&nbsp;</>
        )}
      </span>
      <div className="card-footer">
        <div className="card-footer-column">
          <span className="card-footer-column-label">
            {i18n.t("creds.card.layout.name")}
          </span>
          <span className="card-footer-column-value">
            {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
              <>&nbsp;</>
            ) : (
              // cardData.nameOnCredential
              ""
            )}
          </span>
        </div>
        <div className="card-footer-column">
          <span className="card-footer-column-label">
            {i18n.t("creds.card.layout.issued")}
          </span>
          <span className="card-footer-column-value">
            {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
              <>&nbsp;</>
            ) : (
              formatShortDate(cardData.issuanceDate)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardBodyUniversity;
