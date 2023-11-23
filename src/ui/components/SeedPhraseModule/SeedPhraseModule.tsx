import { IonButton, IonChip, IonIcon } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import "./SeedPhraseModule.scss";
import { SeedPhraseModuleProps } from "./SeedPhraseModule.types";

const SeedPhraseModule = ({
  seedPhrase,
  showSeedPhrase,
  setShowSeedPhrase,
}: SeedPhraseModuleProps) => {
  return (
    <div className="seed-phrase-module">
      <div
        data-testid="seed-phrase-privacy-overlay"
        className={`overlay ${showSeedPhrase ? "hidden" : "visible"}`}
      >
        <IonIcon icon={eyeOffOutline} />
        <p data-testid="seed-phrase-privacy-overlay-text">
          {i18n.t("generateseedphrase.privacy.overlay.text")}
        </p>
        <IonButton
          shape="round"
          fill="outline"
          data-testid="reveal-seed-phrase-button"
          onClick={() => setShowSeedPhrase(true)}
        >
          {i18n.t("generateseedphrase.privacy.overlay.button")}
        </IonButton>
      </div>
      <div
        data-testid="seed-phrase-container"
        className={`seed-phrase-container ${
          showSeedPhrase ? "seed-phrase-visible" : "seed-phrase-blurred"
        }
                }`}
      >
        {seedPhrase.map((word, index) => {
          return (
            <IonChip key={index}>
              <span className="index">{index + 1}.</span>
              <span data-testid={`word-index-${index + 1}`}>{word}</span>
            </IonChip>
          );
        })}
      </div>
    </div>
  );
};

export { SeedPhraseModule };
