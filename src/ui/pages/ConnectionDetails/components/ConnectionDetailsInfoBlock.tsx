import { ReactNode } from "react";
import "./ConnectionDetailsInfoBlock.scss";

const ConnectionDetailsInfoBlock = ({
  title,
  actionButton,
  children,
}: {
  title: string;
  actionButton?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <div className="connection-details-info-block">
      <div className="connection-details-info-block-title">
        <p>{title}</p>
        {actionButton || null}
      </div>
      <div className="connection-details-info-block-inner">
        <div className="connection-details-info-block-line">
          {typeof children === "string" ? <p>{children}</p> : children}
        </div>
      </div>
    </div>
  );
};

export { ConnectionDetailsInfoBlock };
