import { IonLabel, IonSegment, IonSegmentButton } from "@ionic/react";
import { i18n } from "../../../i18n";
import {
  FIFTEEN_WORDS_BIT_LENGTH,
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../globals/constants";
import { MnemonicLengthSegmentProps } from "./MnemonicLengthSegment.types";
import "./MnemonicLengthSegment.scss";

const MnemonicLengthSegment = ({
  seedPhrase,
  toggleSeedPhrase,
}: MnemonicLengthSegmentProps) => {
  return (
    <IonSegment
      data-testid="mnemonic-length-segment"
      className="mnemonic-length-segment"
      value={`${
        seedPhrase.length === MNEMONIC_TWENTYFOUR_WORDS
          ? TWENTYFOUR_WORDS_BIT_LENGTH
          : FIFTEEN_WORDS_BIT_LENGTH
      }`}
      onIonChange={(event) => {
        toggleSeedPhrase(Number(event.detail.value));
      }}
    >
      <IonSegmentButton
        value={`${FIFTEEN_WORDS_BIT_LENGTH}`}
        data-testid="15-words-segment-button"
      >
        <IonLabel>
          {i18n.t("generateseedphrase.segment", {
            length: MNEMONIC_FIFTEEN_WORDS,
          })}
        </IonLabel>
      </IonSegmentButton>
      <IonSegmentButton
        value={`${TWENTYFOUR_WORDS_BIT_LENGTH}`}
        data-testid="24-words-segment-button"
      >
        <IonLabel>
          {i18n.t("generateseedphrase.segment", {
            length: MNEMONIC_TWENTYFOUR_WORDS,
          })}
        </IonLabel>
      </IonSegmentButton>
    </IonSegment>
  );
};

export { MnemonicLengthSegment };
