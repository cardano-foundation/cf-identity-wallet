enum OnboardingMode {
  Create = "create",
  Recovery = "recovery",
}

interface SwitchOnboardingModeModalProps {
  mode: OnboardingMode;
  isOpen: boolean;
  setOpen: (value: boolean) => void;
}

export type { SwitchOnboardingModeModalProps };
export { OnboardingMode };
