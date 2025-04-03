import { ConfigurationService } from "../../core/configuration";

const canAccessFeature = (
  key: keyof typeof ConfigurationService.accessConfigs
) => {
  if (!ConfigurationService.accessConfigs) return true;
  return !!ConfigurationService.accessConfigs?.[key]?.active;
};

export { canAccessFeature };
