import { useEffect, useState } from "react";
import "./ReadMore.scss";
import { IonButton } from "@ionic/react";

const ReadMore = ({
  content,
  maxWords,
}: {
  content: string;
  maxWords: number;
}) => {
  const [text, setText] = useState("");
  const [isReadMore, setIsReadMore] = useState(false);

  const readLess = () => {
    const words = content.split(" ");
    if (words.length > maxWords) {
      const shortenedText = words.slice(0, maxWords).join(" ") + "...";
      setText(shortenedText);
    } else {
      setText(content);
    }
  };
  useEffect(() => {
    readLess();
  }, []);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
    if (isReadMore) {
      readLess();
    } else {
      setText(content);
    }
  };

  return (
    <div className="read-more">
      <span>{text}</span>
      <IonButton onClick={toggleReadMore}>
        {isReadMore ? "Read Less" : "Read More"}
      </IonButton>
    </div>
  );
};

export { ReadMore };
