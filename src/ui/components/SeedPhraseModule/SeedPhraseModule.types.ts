interface SeedPhraseModuleProps {
  testId: string;
  seedPhrase: string[];
  hideSeedPhrase?: boolean;
  setHideSeedPhrase?: (value: boolean) => void;
  addSeedPhraseSelected?: (word: string) => void;
  removeSeedPhraseSelected?: (index: number) => void;
  emptyWord?: boolean;
  hideSeedNumber?: boolean;
}

export type { SeedPhraseModuleProps };
