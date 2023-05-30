import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { i18n } from "../../../i18n";
import { didsMock } from "../../__mocks__/didsMock";
import { DataProps } from "./Dids.types";
import "./Dids.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";

const identities: DataProps[] = didsMock;

const OtherButtons = () => {
  return (
    <>
      <IonButton
        shape="round"
        className="contacts-button"
        data-testid="contacts-button"
      >
        <IonIcon
          slot="icon-only"
          icon={peopleOutline}
          color="primary"
        />
      </IonButton>
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-button"
      >
        <IonIcon
          slot="icon-only"
          icon={addOutline}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const handleCreateDid = () => {
  // TODO: Function to create DID
};

const CardsStack = () => {
  const cardBackgroundColor = [
    "linear-gradient(91.86deg, #92FFC0 28.76%, #47FF94 119.14%)",
    "linear-gradient(91.86deg, #FFBC60 28.76%, #FFA21F 119.14%)",
    "linear-gradient(91.86deg, #D9EDDF 28.76%, #ACD8B9 119.14%)",
    "linear-gradient(91.86deg, #47E0FF 28.76%, #00C6EF 119.14%)",
    "linear-gradient(91.86deg, #B5C2FF 28.76%, #708AFF 119.14%)",
    "linear-gradient(91.86deg, #FF9780 28.76%, #FF5833 119.14%)",
  ];
  const cardColorSelector = (index: number) => {
    if (index > 5) {
      return cardBackgroundColor[index % 6];
    } else {
      return cardBackgroundColor[index % 6];
    }
  };
  const renderCards = (data: DataProps[]) => {
    return data.map((did, index) => (
      <div
        key={index}
        className="card"
        style={{ background: cardColorSelector(index) }}
      >
        <span>{did.type}</span>
        <span>{did.name}</span>
      </div>
    ));
  };

  return <div className="container">{renderCards(identities)}</div>;
};

const Dids = () => {
  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.DIDS}
        header={true}
        title="Identities"
        menuButton={true}
        otherButtons={<OtherButtons />}
      >
        {identities.length ? (
          <CardsStack />
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("dids.label.create")}
            buttonAction={handleCreateDid}
          />
        )}
      </TabLayout>
    </IonPage>
  );
};

export { Dids, OtherButtons };
