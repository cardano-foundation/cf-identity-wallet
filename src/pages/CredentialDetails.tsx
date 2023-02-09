import React from 'react';
import {
  IonAvatar,
  IonCard,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {useLocation} from 'react-router-dom';
import {checkmarkCircleOutline, closeCircleOutline} from 'ionicons/icons';

const CredentialDetails = (props) => {
  const location = useLocation();
  const cred = location.state?.dataObject;

  const title = () => {
    switch (cred.name) {
      case 'Proof Of Origin':
        return cred.holderInformation.product;
      case 'CBCA Certificate':
        return cred.issuerInformation.curriculum;
      default:
        return cred.holderInformation.title;
    }
  };

  return (
    cred && (
      <IonPage id={cred.name}>
        <CustomPage
          name={cred.name}
          sideMenu={false}
          sideMenuPosition="start"
          backButton={true}
          backButtonText="Back"
          backButtonPath={'/tabs/credentials'}
          actionButton={false}
          actionButtonIcon={addOutline}
          actionButtonIconSize="1.7rem">
          <IonGrid fixed={true}>
            <IonRow>
              <IonCol className="flex flex-row-reverse">
                {cred.isVerified ? (
                  <IonItem>
                    <IonIcon
                      size="small"
                      icon={checkmarkCircleOutline}
                      color="success"
                      className="mr-2"
                    />
                    verified on Cardano
                  </IonItem>
                ) : (
                  <IonItem>
                    <IonIcon
                      size="small"
                      icon={closeCircleOutline}
                      color="danger"
                      className="mr-2"
                    />
                    unverified
                  </IonItem>
                )}
              </IonCol>
            </IonRow>
            <IonCard className="mt-1">
              <IonRow className="py-2">
                <IonCol size="3">
                  <IonAvatar className="py-0 mx-auto">
                    <img
                      src={cred.holderInformation.imageUrl}
                      alt=""
                      className="w-14 h-14"
                    />
                  </IonAvatar>
                </IonCol>
                <IonCol size="9">
                  <IonLabel className="py-3">
                    <h1>
                      <strong className="capitalize pr-3">
                        {cred.name === 'Proof Of Origin'
                          ? cred.holderInformation.origin
                          : cred.holderInformation.name}
                      </strong>
                    </h1>
                    <p>
                      {title()}
                      {/* {cred.name === 'Proof Of Origin' &&
                        cred.holderInformation.product}
                      {cred.name === 'CBCA Certificate'
                        ? cred.issuerInformation.curriculum
                        : cred.holderInformation.title} */}
                    </p>
                  </IonLabel>
                </IonCol>
              </IonRow>
            </IonCard>

            <IonLabel className="input-label">
              <h3 className="text-center mb-3">Holder Information</h3>
            </IonLabel>

            <IonCard className="mt-2 mb-8">
              <IonList
                lines="full"
                className="mx-2 my-4">
                {Object.keys(cred.holderInformation).map(
                  (value, key) =>
                    Object.keys(cred.holderInformation)[key] !== 'imageUrl' && (
                      <IonItem key={key}>
                        <IonLabel className="input-label">
                          <strong className="capitalize pr-3">
                            {Object.keys(cred.holderInformation)[key]}:
                          </strong>
                          {cred.holderInformation[value]}
                        </IonLabel>
                      </IonItem>
                    )
                )}
              </IonList>
            </IonCard>

            <IonLabel className="input-label">
              <h3 className="text-center mb-3">Issuer Information</h3>
            </IonLabel>

            <IonCard className="mt-2 mb-8">
              <IonList
                lines="full"
                className="mx-2 my-4">
                {Object.keys(cred.issuerInformation).map((value, key) => (
                  <IonItem key={key}>
                    <IonLabel className="input-label">
                      <strong className="capitalize pr-3">
                        {Object.keys(cred.issuerInformation)[key]}:
                      </strong>
                      {cred.issuerInformation[value]}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCard>

            <IonLabel className="input-label">
              <h3 className="text-center mb-3">Attachment</h3>
            </IonLabel>

            <IonCard className="my-2">
              <IonList
                lines="full"
                className="mx-2 my-4">
                {Object.keys(cred.attachments).map((value, key) => (
                  <IonItem key={key}>
                    <IonLabel className="input-label">
                      <strong className="capitalize pr-3">
                        {Object.keys(cred.attachments)[key]}:
                      </strong>
                      {cred.attachments[value]}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCard>
          </IonGrid>
        </CustomPage>
      </IonPage>
    )
  );
};

export default CredentialDetails;
