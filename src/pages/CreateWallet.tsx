import React, {useState} from 'react';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonProgressBar,
  IonRow,
  IonToggle,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import './CreateWallet.css';

const CreateWallet = (props) => {
  const pageName = 'Create Wallet';
  const [walletName, setWalletName] = useState<string>();
  const [walletPassword, setWalletPassword] = useState<string>();
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isPasswordMatching, setIsPasswordMatching] = useState<boolean>();

  const nameValidator = (text: string) => {
    // Lower and upper case alphanumeric between 2 and 16 characters
    return text.match(/^[a-zA-Z0-9]{2,16}$/);
  };

  const validateName = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setWalletName(value);
    setIsNameValid(undefined);
    if (value === '') return;
    nameValidator(value) !== null
      ? setIsNameValid(true)
      : setIsNameValid(false);
  };

  const passwordValidator = (text: string) => {
    // At least 1 number, 1 lower case, 1 upper case, between 8 and 32 characters
    return text.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,32}$/);
  };

  const validatePassword = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setWalletPassword(value);
    setIsPasswordValid(undefined);
    if (value === '') return;
    passwordValidator(value) !== null
      ? setIsPasswordValid(true)
      : setIsPasswordValid(false);
  };

  const matchPassword = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setIsPasswordMatching(undefined);
    if (value === '') return;
    value === walletPassword
      ? setIsPasswordMatching(true)
      : setIsPasswordMatching(false);
  };

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/tabs/crypto'}
        actionButton={false}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem">
        <IonProgressBar
          value={0.25}
          buffer={1}
        />
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonItem>
                <IonLabel>
                  <h4>The password unlocks the wallet in this device...</h4>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonItem
                fill="solid"
                className={`mb-4 ${isNameValid && 'ion-valid'} ${
                  isNameValid === false && 'ion-invalid'
                }`}>
                <IonLabel position="stacked">
                  <strong>Enter Wallet/Account Name</strong>
                </IonLabel>
                <IonInput
                  type="text"
                  placeholder="Enter text"
                  onIonInput={(event) => validateName(event)}
                  className="mb-0"
                />
                <IonNote slot="error">Invalid name</IonNote>
              </IonItem>
              <IonItem
                fill="solid"
                className={`mb-4 ${isPasswordValid && 'ion-valid'} ${
                  isPasswordValid === false && 'ion-invalid'
                }`}>
                <IonLabel position="stacked">
                  <strong>Set Spending Password</strong>
                </IonLabel>
                <IonInput
                  type="password"
                  placeholder="Enter text"
                  onIonInput={(event) => validatePassword(event)}
                  className="mb-0"
                />
                <IonNote slot="error">Invalid password</IonNote>
              </IonItem>
              <IonItem
                fill="solid"
                className={`mb-4 ${isPasswordMatching && 'ion-valid'} ${
                  isPasswordMatching === false && 'ion-invalid'
                }`}>
                <IonLabel position="stacked">
                  <strong>Confirm Spending Password</strong>
                </IonLabel>
                <IonInput
                  type="password"
                  placeholder="Enter text"
                  onIonInput={(event) => matchPassword(event)}
                  className="mb-0"
                />
                <IonNote slot="error">Password not matching</IonNote>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel>
                  <h3>Unlock with Face ID</h3>
                </IonLabel>
                <IonToggle slot="end" />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonCheckbox slot="start" />
                <IonLabel className="terms_and_conditions">
                  I understand that if I lose my recovery phrase, I will not be
                  able to access my account <a href="#">Terms</a>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="dark"
                expand="block"
                href="/recoveryseedphrase"
                disabled={
                  !(isNameValid && isPasswordValid && isPasswordMatching)
                }>
                Continue
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="light"
                expand="block"
                href="/tabs/crypto">
                Cancel
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default CreateWallet;
