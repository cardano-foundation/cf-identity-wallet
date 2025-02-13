import { DeviceInfo } from "@capacitor/device";

enum MetRequirementStatus {
  MetRequirement = "met",
  NotMetRequirement = "not-met",
}

interface SystemCompatibilityAlertProps {
  deviceInfo: DeviceInfo | null;
}

interface RequirementItemProps {
  name: string;
  value: string | number;
  status?: MetRequirementStatus;
}

export { MetRequirementStatus };
export type { SystemCompatibilityAlertProps, RequirementItemProps };
