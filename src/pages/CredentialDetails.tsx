import React, {useState} from 'react';
import {
  IonCard,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {useLocation} from 'react-router-dom';
import {checkmarkCircleOutline, closeCircleOutline} from 'ionicons/icons';

const CredentialDetails = (props) => {
  const location = useLocation();
  const cred = location.state.dataObject;
  const [currentSelection, setCurrentSelection] = useState('holderInformation');

  return (
    <IonPage id={cred.name}>
      <CustomPage
        name={cred.name}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/tabs/creds'}
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
                  verified
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
            <IonRow>
              <IonCol size="3">
                <IonImg
                  className="w-20 py-0"
                  src={cred.imageUrl}
                />
              </IonCol>
              <IonCol size="9">
                <IonLabel className="py-3">
                  <h1>
                    <strong>{cred.holderInformation.name}</strong>
                  </h1>
                  <p>
                    {cred.holderInformation.title} #{cred.id}
                  </p>
                </IonLabel>
              </IonCol>
            </IonRow>
          </IonCard>
          <IonList>
            <IonItem>
              <IonSelect
                className="mx-auto"
                onIonChange={(ev) => setCurrentSelection(ev.detail.value)}
                selected-text={
                  currentSelection === 'holderInformation'
                    ? 'Holder Information'
                    : 'Issuer Information'
                }>
                <IonSelectOption value="holderInformation">
                  Holder Information
                </IonSelectOption>
                <IonSelectOption value="issuerInformation">
                  Issuer Information
                </IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          {currentSelection === 'holderInformation' ? (
            <IonList
              lines="full"
              className="mx-2 mt-4">
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>Name: {cred.holderInformation.name}</IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>Email: {cred.holderInformation.email}</IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>
                  Department: {cred.holderInformation.department}
                </IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>
                  Enrolment: {cred.holderInformation.enrolment}
                </IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500">
                <IonLabel>Program: {cred.holderInformation.program}</IonLabel>
              </IonItem>
            </IonList>
          ) : (
            <IonList
              lines="full"
              className="mx-2 mt-4">
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>Name: {cred.issuerInformation.name}</IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>Email: {cred.issuerInformation.email}</IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>Office: {cred.issuerInformation.office}</IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500 border-b-0">
                <IonLabel>DID: {cred.issuerInformation.did}</IonLabel>
              </IonItem>
              <IonItem className="border-solid border border-gray-500">
                <IonLabel>
                  Date Issued: {cred.issuerInformation.issuedDate}
                </IonLabel>
              </IonItem>
            </IonList>
          )}
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default CredentialDetails;
