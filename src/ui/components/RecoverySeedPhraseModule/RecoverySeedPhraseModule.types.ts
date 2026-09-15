interface SeedPhraseInfo {
  value: string;
  suggestions: string[];
}

interface RecoverySeedPhraseModuleProps {
  title?: string;
  description?: string;
  testId: string;
  onVerifySuccess: () => void;
  overrideAlertZIndex?: boolean;
  displaySwitchModeButton?: boolean;
  // Checks the words against the phrase of this wallet. Off while recovering,
  // there is no wallet yet and the typed phrase is the source of truth
  matchStoredPhrase?: boolean;
}

interface RecoverySeedPhraseModuleRef {
  clearState: () => void;
}

export type {
  SeedPhraseInfo,
  RecoverySeedPhraseModuleProps,
  RecoverySeedPhraseModuleRef,
};
