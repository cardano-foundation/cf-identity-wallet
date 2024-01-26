import { CardDetailsBlockProps } from "./CardDetailsElements.types";

const CardDetailsBlock = ({ title, children }: CardDetailsBlockProps) => {
  return (
    <div className="card-details-info-block">
      <h3>{title}</h3>
      <div className="card-details-info-block-inner">{children}</div>
    </div>
  );
};

export { CardDetailsBlock };
