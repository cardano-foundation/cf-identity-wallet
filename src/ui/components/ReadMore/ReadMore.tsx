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
    <div className="read-more">
      <span className={isReadMore ? "" : "clamp"}>{content}</span>
      <IonButton onClick={toggleReadMore}>
        {isReadMore ? i18n.t("readmore.less") : i18n.t("readmore.more")}
      </IonButton>
    </div>
  );
};

export { ReadMore };
