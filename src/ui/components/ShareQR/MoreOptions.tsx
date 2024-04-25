import { Share } from "@capacitor/share";
import { openOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { OptionList } from "../OptionsModal";

const MoreOptions = ({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) => {
  return (
    <OptionList
      data={[
        {
          testId: "share-qr-modal-share-button",
          onClick: async () => {
            if (onClick) onClick();
            await Share.share({
              text: text,
            });
          },
          icon: openOutline,
          label: `${i18n.t("shareqr.more")}`,
        },
      ]}
    />
  );
};

export { MoreOptions };
