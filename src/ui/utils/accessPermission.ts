import { ConfigurationService } from "../../core/configuration";

const canAccessFeature = (
  key: keyof typeof ConfigurationService.env.accessPermison
) => {
  if (!ConfigurationService.env.accessPermison) return true;
  return !!ConfigurationService.env.accessPermison[key]?.active;
};

export { canAccessFeature };
