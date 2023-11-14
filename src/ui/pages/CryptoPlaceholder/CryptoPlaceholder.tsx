import { Trans } from "react-i18next";
import { useState } from "react";
import {
  IonCol,
  IonGrid,
  IonModal,
  IonPage,
  IonRow,
  useIonViewWillEnter,
} from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./CryptoPlaceholder.scss";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";

const CryptoPlaceholder = () => {
  const dispatch = useAppDispatch();
  const [featuresModalIsOpen, setFeaturesModalIsOpen] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO_PLACEHOLDER }));
  });

  const HandleFeatures = () => {
    return (
      <a onClick={() => setFeaturesModalIsOpen(true)}>
        <u>{i18n.t("cryptoplaceholder.tab.action.link")}</u>
      </a>
    );
  };

  const features: string[] = i18n.t("cryptoplaceholder.modal.features", {
    returnObjects: true,
  });

  return (
    <>
      <IonPage
        className="tab-layout"
        data-testid="crypto-placeholder-tab"
      >
        <TabLayout
          header={true}
          menuButton={true}
        >
          <div className="crypto-placeholder-tab-content">
            <h2>{i18n.t("cryptoplaceholder.tab.header")}</h2>
            <Trans
              i18nKey={i18n.t("cryptoplaceholder.tab.action.text")}
              components={[<HandleFeatures key="" />]}
            />
          </div>
        </TabLayout>
      </IonPage>
      <IonModal
        isOpen={featuresModalIsOpen}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
        className="page-layout"
        data-testid="crypto-placeholder-modal"
        onDidDismiss={() => setFeaturesModalIsOpen(false)}
      >
        <div className="crypto-placeholder-modal modal">
          <PageLayout
            header={true}
            closeButton={true}
            closeButtonLabel={`${i18n.t("cryptoplaceholder.modal.done")}`}
            closeButtonAction={() => setFeaturesModalIsOpen(false)}
            title={`${i18n.t("cryptoplaceholder.modal.title")}`}
          >
            <IonGrid>
              <IonRow>
                <IonCol
                  size="12"
                  className="crypto-placeholder-modal-body"
                >
                  <ol>
                    {features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ol>
                </IonCol>
              </IonRow>
            </IonGrid>
          </PageLayout>
        </div>
      </IonModal>
    </>
  );
};

export { CryptoPlaceholder };
