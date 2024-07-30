enum OnboardingMode {
  Create = "create",
  Recovery = "recovery",
}

interface SwitchOnboardingModeProps {
  mode: OnboardingMode;
}

export type { SwitchOnboardingModeProps };
export { OnboardingMode };
