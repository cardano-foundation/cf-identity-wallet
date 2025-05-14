import { i18n } from "../../../../i18n";
import LockIcon from "../../../assets/images/lock-icon.png";
import { PageFooter } from "../../../components/PageFooter";
import { SetupPasswordProps } from "./SetupPassword.types";
import "./SetupPassword.scss";

export const SetupPassword = ({
  onSetupPasswordClick,
  onSkipClick,
}: SetupPasswordProps) => {
  return (
    <div className="setup-password">
      <div className="page-info">
        <img
          src={LockIcon}
          alt="lock-icon"
        />
        <h1>{i18n.t("createpassword.setuppassword.title")}</h1>
        <p>{i18n.t("createpassword.setuppassword.description")}</p>
      </div>
      <PageFooter
        primaryButtonText={`${i18n.t(
          "createpassword.setuppassword.button.enable"
        )}`}
        primaryButtonAction={onSetupPasswordClick}
        tertiaryButtonText={`${i18n.t(
          "createpassword.setuppassword.button.skip"
        )}`}
        tertiaryButtonAction={onSkipClick}
      />
    </div>
  );
};
