import { ReactNode } from "react";
import "./ConnectionDetailsInfoBlock.scss";

const ConnectionDetailsInfoBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="connection-details-info-block">
      <p>{title}</p>
      <div className="connection-details-info-block-inner">
        <div className="connection-details-info-block-line">
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
};

export { ConnectionDetailsInfoBlock };
