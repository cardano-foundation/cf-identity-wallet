interface SeedPhraseInfo {
  value: string;
  suggestions: string[];
}

interface RecoverySeedPhraseModuleProps {
  title?: string;
  description: string;
  testId: string;
  onVerifySuccess: () => void;
}

interface RecoverySeedPhraseModuleRef {
  clearState: () => void;
}

export type {
  SeedPhraseInfo,
  RecoverySeedPhraseModuleProps,
  RecoverySeedPhraseModuleRef,
};
