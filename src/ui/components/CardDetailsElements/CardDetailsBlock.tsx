import { CardDetailsBlockProps } from "./CardDetailsElements.types";

const CardDetailsBlock = ({ title, children }: CardDetailsBlockProps) => {
  return (
    <div className="card-details-info-block">
      <h4>{title}</h4>
      <div className="card-details-info-block-inner">{children}</div>
    </div>
  );
};

export { CardDetailsBlock };
