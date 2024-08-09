interface SeedPhraseModuleProps {
  testId: string;
  seedPhrase: string[];
  hideSeedPhrase?: boolean;
  showSeedPhraseButton?: boolean;
  overlayText?: string;
  setHideSeedPhrase?: (value: boolean) => void;
  addSeedPhraseSelected?: (word: string) => void;
  removeSeedPhraseSelected?: (index: number) => void;
  emptyWord?: boolean;
  hideSeedNumber?: boolean;
  inputMode?: boolean;
  onInputChange?: (value: string, index: number) => void;
  onInputFocus?: (index: number) => void;
  onInputBlur?: (index: number) => void;
  errorInputIndexs?: number[];
}

interface SeedPhraseModuleRef {
  focusInputByIndex: (index: number) => void;
}

export type { SeedPhraseModuleProps, SeedPhraseModuleRef };
