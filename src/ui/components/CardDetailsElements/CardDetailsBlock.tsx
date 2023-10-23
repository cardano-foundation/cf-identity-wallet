import { i18n } from "../../../i18n";
import { CardDetailsBlockProps } from "./CardDetailsElements.types";

const CardDetailsBlock = ({ title, children }: CardDetailsBlockProps) => {
  return (
    <div className="card-details-info-block">
      <h3>{i18n.t(title)}</h3>
      <div className="card-details-info-block-inner">{children}</div>
    </div>
  );
};

export { CardDetailsBlock };
