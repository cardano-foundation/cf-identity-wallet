import { IonCheckbox, IonContent, IonModal } from "@ionic/react";
import { useState } from "react";
import { IdentifierShortDetails } from "../../../../../core/agent/services/identifier.types";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { CardItem, CardList } from "../../../../components/CardList";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import "./IdentifierSelectorModal.scss";
import { IdentifierSelectorProps } from "./IdentifierSelectorModal.types";

const IdentifierSelectorModal = ({
  open,
  setOpen,
  onSubmit,
}: IdentifierSelectorProps) => {
  const identifierCache = useAppSelector(getIdentifiersCache);

  const [selectedIdentifier, setSelectedIdentifier] =
    useState<IdentifierShortDetails | null>(null);

  const displayIdentifiers = identifierCache
    .filter((item) => !item.isPending)
    .map(
      (identifier): CardItem<IdentifierShortDetails> => ({
        id: identifier.id,
        title: identifier.displayName,
        image: KeriLogo,
        data: identifier,
      })
    );

  const handleSelectIdentifier = (data: IdentifierShortDetails) => {
    setSelectedIdentifier(selectedIdentifier?.id === data.id ? null : data);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConnectWallet = async () => {
    if (!selectedIdentifier) return;
    handleClose();
    onSubmit(selectedIdentifier);
    setSelectedIdentifier(null);
  };

  return (
    <IonModal
      isOpen={open}
      onDidDismiss={handleClose}
    >
      <ResponsivePageLayout
        pageId="connection-identifier-selector"
        activeStatus={open}
        header={
          <PageHeader
            title={`${i18n.t("connections.tab.indentifierselector.title")}`}
            closeButton
            closeButtonLabel={`${i18n.t(
              "connections.tab.indentifierselector.button.cancel"
            )}`}
            closeButtonAction={handleClose}
            hardwareBackButtonConfig={{
              prevent: !open,
            }}
          />
        }
      >
        <h2 className="title">
          {i18n.t("connections.tab.indentifierselector.message")}
        </h2>
        <IonContent className="identifier-list">
          <CardList
            data={displayIdentifiers}
            onCardClick={(data, e) => {
              e.stopPropagation();
            }}
            onRenderEndSlot={(data) => {
              return (
                <IonCheckbox
                  checked={selectedIdentifier?.id === data.id}
                  aria-label=""
                  className="checkbox"
                  data-testid={`identifier-select-${data.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectIdentifier(data);
                  }}
                />
              );
            }}
          />
        </IonContent>
        <PageFooter
          primaryButtonText={`${i18n.t(
            "connections.tab.indentifierselector.button.confirm"
          )}`}
          primaryButtonAction={handleConnectWallet}
          primaryButtonDisabled={!selectedIdentifier}
        />
      </ResponsivePageLayout>
    </IonModal>
  );
};

export { IdentifierSelectorModal };
