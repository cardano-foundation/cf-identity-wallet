import { useState } from "react";
import "./ReadMore.scss";
import { IonButton } from "@ionic/react";
import { i18n } from "../../../i18n";

const ReadMore = ({ content }: { content: string }) => {
  const [isReadMore, setIsReadMore] = useState(false);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  return (
    <div
      data-testid="read-more"
      className="read-more"
    >
      <span
        data-testid="read-more-text"
        className={isReadMore ? "" : "clamp"}
      >
        {content}
      </span>
      <IonButton
        onClick={toggleReadMore}
        data-testid="read-more-button"
      >
        {isReadMore ? i18n.t("readmore.less") : i18n.t("readmore.more")}
      </IonButton>
    </div>
  );
};

export { ReadMore };
