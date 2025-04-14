import { ConfigurationService } from "../../core/configuration";
import { OptionalFeature } from "../../core/configuration/configurationService.types";

const checkFeatureAvailable = (feature: OptionalFeature) => {
  return !ConfigurationService.env?.features.cut.includes(feature);
};

export { checkFeatureAvailable };
