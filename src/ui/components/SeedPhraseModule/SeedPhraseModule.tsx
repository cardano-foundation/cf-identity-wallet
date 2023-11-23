import { IonButton, IonChip, IonIcon } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import "./SeedPhraseModule.scss";
import { SeedPhraseModuleProps } from "./SeedPhraseModule.types";

const SeedPhraseModule = ({
  testId,
  seedPhrase,
  hideSeedPhrase,
  setHideSeedPhrase,
  addSeedPhraseSelected,
  removeSeedPhraseSelected,
  emptyWord,
}: SeedPhraseModuleProps) => {
  return (
    <div
      className={`seed-phrase-module ${
        hideSeedPhrase ? "seed-phrase-hidden" : "seed-phrase-visible"
      }`}
    >
      <div
        data-testid="seed-phrase-privacy-overlay"
        className={"overlay"}
      >
        <IonIcon icon={eyeOffOutline} />
        <p data-testid="seed-phrase-privacy-overlay-text">
          {i18n.t("generateseedphrase.privacy.overlay.text")}
        </p>
        <IonButton
          shape="round"
          fill="outline"
          data-testid="reveal-seed-phrase-button"
          onClick={() => setHideSeedPhrase && setHideSeedPhrase(false)}
        >
          {i18n.t("generateseedphrase.privacy.overlay.button")}
        </IonButton>
      </div>
      <div
        data-testid={testId}
        className={"seed-phrase-container"}
      >
        {seedPhrase.map((word, index) => {
          return (
            <IonChip
              key={index}
              onClick={() => {
                if (removeSeedPhraseSelected) {
                  removeSeedPhraseSelected(index);
                } else if (addSeedPhraseSelected) {
                  addSeedPhraseSelected(word);
                }
              }}
            >
              <span className="index">{index + 1}.</span>
              <span data-testid={`word-index-${index + 1}`}>{word}</span>
            </IonChip>
          );
        })}
        {emptyWord && (
          <IonChip className="empty-word">
            <span className="index">{seedPhrase.length + 1}.</span>
          </IonChip>
        )}
      </div>
    </div>
  );
};

export { SeedPhraseModule };
