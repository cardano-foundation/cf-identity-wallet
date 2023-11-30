import { ReactNode } from "react";

const ConnectionDetailsInfoBlock = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="connection-details-info-block">
      <h3>{title}</h3>
      <div className="connection-details-info-block-inner">
        <div className="connection-details-info-block-line">
          <div className="connection-details-info-block-data">{children}</div>
        </div>
      </div>
    </div>
  );
};

export { ConnectionDetailsInfoBlock };
