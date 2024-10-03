import { IonButton } from "@ionic/react";

const AlphabetSelector = () => {
  const alphabet = new Array(26)
    .fill(1)
    .map((_, i) => String.fromCharCode(65 + i))
    .concat("#");

  const handleClickScroll = (letter: string) => {
    const element = document.getElementById(letter);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="alphabet-selector">
      {alphabet.map((letter, index) => {
        return (
          <IonButton
            slot="fixed"
            onClick={() => handleClickScroll(letter)}
            key={index}
            color="transparent"
          >
            {letter}
          </IonButton>
        );
      })}
    </div>
  );
};

export { AlphabetSelector };
