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
import CustomPage from '../layouts/PageLayout';
import {useLocation} from 'react-router-dom';
import {checkmarkCircleOutline, closeCircleOutline} from 'ionicons/icons';

const CredentialDetails = (props) => {
  const location = useLocation();
  const cred = location.state?.dataObject;

  const title = () => {
    switch (cred.category) {
      case 'Supply Chain':
        return cred.holderInformation.product;
      case 'Certification':
        return cred.issuerInformation.curriculum;
      case 'Admissions':
        return cred.holderInformation.event;
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
              <IonCol className="flex flex-row-reverse p-0">
                {cred.isVerified ? (
                  <IonItem>
                    <IonIcon
                      size="small"
                      icon={checkmarkCircleOutline}
                      color="success"
                      className="mr-2"
                    />
                    <IonLabel className="mb-4">
                      <p>verified on Cardano</p>
                    </IonLabel>
                  </IonItem>
                ) : (
                  <IonItem>
                    <IonIcon
                      size="small"
                      icon={closeCircleOutline}
                      color="danger"
                      className="mr-2"
                    />
                    <IonLabel>
                      <p>unverified</p>
                    </IonLabel>
                  </IonItem>
                )}
              </IonCol>
            </IonRow>
            <IonCard className="mt-1">
              <IonRow className="py-2">
                <IonCol size="3">
                  <IonAvatar className="py-0 mx-auto">
                    <img
                      src={require(`../../assets/images/${cred.holderInformation.imageUrl}`)}
                      alt="Credential holder"
                      className="w-14 h-14"
                    />
                  </IonAvatar>
                </IonCol>
                <IonCol size="9">
                  <IonLabel
                    color="primary"
                    className="pt-3">
                    <h1>
                      <strong className="capitalize pr-3">
                        {cred.category === 'Supply Chain'
                          ? cred.holderInformation.origin
                          : cred.holderInformation.name}
                      </strong>
                    </h1>
                  </IonLabel>
                  <IonLabel className="pb-3">
                    <p>{title()}</p>
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
                          <span className="text-base">
                            {cred.holderInformation[value]}
                          </span>
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
                      <span className="text-base">
                        {cred.issuerInformation[value]}
                      </span>
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
                      <span className="text-base">
                        {cred.attachments[value]}
                      </span>
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
