import { i18n } from "../../../i18n";

const CardBodyPending = () => {
  return (
    <>
      <div className="card-body">
        <span>
          <>&nbsp;</>
        </span>
      </div>
      <div className="card-footer">
        <div className="card-footer-column">
          <span className="card-footer-column-label">
            {i18n.t("creds.card.layout.type")}
          </span>
          <span className="card-footer-column-value">
            <>&nbsp;</>
          </span>
        </div>
        <div className="card-footer-column">
          <span className="card-footer-column-label">
            {i18n.t("creds.card.layout.validity")}
          </span>
          <span className="card-footer-column-value">
            <>&nbsp;</>
          </span>
        </div>
      </div>
    </>
  );
};

export default CardBodyPending;
