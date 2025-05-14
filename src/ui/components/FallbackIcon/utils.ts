import { ConfigurationService } from "../../../core/configuration";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import UserLogo from "../../assets/images/user-fallback.png";

export const getFallbackIcon = () => {
  return ConfigurationService.env.features.fallbackIcon ? UserLogo : KeriLogo;
};
