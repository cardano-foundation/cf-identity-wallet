import { IonCard, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../../../../../i18n";
import { TermsModal } from "../../../../../../components/TermsModal";

const TermAndPrivacy = () => {
  const [openTerm, setOpenTerm] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  return (
    <>
      <div className="settings-section-title-placeholder" />
      <IonCard>
        <IonList
          lines="none"
          data-testid="settings-security-items"
        >
          <IonItem
            onClick={() => setOpenTerm(true)}
            className="settings-item"
            data-testid="term-modal-btn"
          >
            <IonLabel>
              {i18n.t(
                "settings.sections.support.terms.submenu.termandcondition"
              )}
            </IonLabel>
            <IonIcon
              aria-hidden="true"
              icon={chevronForward}
              slot="end"
            />
          </IonItem>
          <IonItem
            onClick={() => setOpenPrivacy(true)}
            className="settings-item"
            data-testid="privacy-modal-btn"
          >
            <IonLabel>
              {i18n.t("settings.sections.support.terms.submenu.privacy")}
            </IonLabel>
            <IonIcon
              aria-hidden="true"
              icon={chevronForward}
              slot="end"
            />
          </IonItem>
        </IonList>
      </IonCard>
      <TermsModal
        name="terms-of-use"
        isOpen={openTerm}
        setIsOpen={setOpenTerm}
      />
      <TermsModal
        name="privacy-policy"
        isOpen={openPrivacy}
        setIsOpen={setOpenPrivacy}
      />
    </>
  );
};

export { TermAndPrivacy };
