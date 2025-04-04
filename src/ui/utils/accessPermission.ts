import { ConfigurationService } from "../../core/configuration";

const canAccessFeature = (
  key: keyof typeof ConfigurationService.env.accessPermission
) => {
  if (!ConfigurationService.env.accessPermission) return true;

  return !!ConfigurationService.env.accessPermission[key]?.active;
};

export { canAccessFeature };
