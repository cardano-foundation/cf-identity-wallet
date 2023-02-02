import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
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
  const nav = useHistory();
  const [walletName, setWalletName] = useState<string>();
  const [walletPassword, setWalletPassword] = useState<string>();
  const [isNameValid, setIsNameValid] = useState<boolean>();
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>();
  const [isPasswordMatching, setIsPasswordMatching] = useState<boolean>();
  const [checked, setChecked] = useState(false);

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

  const passwordMatcher = (text: string) => {
    return text.match(`(?:^|W)${walletPassword}(?:$|W)`);
  };

  const matchPassword = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setIsPasswordMatching(undefined);
    if (value === '') return;
    passwordMatcher(value) !== null
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
        <form>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
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
                    <strong>Enter Wallet Name</strong>
                  </IonLabel>
                  <IonInput
                    type="text"
                    placeholder="Enter text"
                    onIonInput={(event) => validateName(event)}
                    onIonBlur={(event) => validateName(event)}
                    required={true}
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
                    disabled={!isNameValid}
                    onIonInput={(event) => validatePassword(event)}
                    onIonBlur={(event) => validatePassword(event)}
                    required={true}
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
                    disabled={!isPasswordValid}
                    onIonInput={(event) => matchPassword(event)}
                    onIonBlur={(event) => matchPassword(event)}
                    required={true}
                    className="mb-0"
                  />
                  <IonNote slot="error">Password not matching</IonNote>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid className="mt-3">
            <IonRow>
              <IonCol size="12">
                <IonItem>
                  <IonLabel>
                    <h3>Unlock with Face ID</h3>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    onIonChange={() => nav.replace('/faceidsetup')}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid className="mt-3">
            <IonRow className="ion-text-center">
              <IonCol>
                <IonItem>
                  <IonCheckbox
                    slot="start"
                    checked={checked}
                    disabled={!isPasswordMatching}
                    onIonChange={(e) => setChecked(e.detail.checked)}
                  />
                  <IonLabel className="terms_and_conditions">
                    I understand that if I lose my recovery phrase, I will not
                    be able to access my account{' '}
                    <a href="/termsandconditions">
                      <u>Terms</u>
                    </a>
                  </IonLabel>
                </IonItem>
                <IonButton
                  shape="round"
                  color="dark"
                  expand="block"
                  className="h-auto my-4"
                  href="/recoveryseedphrase"
                  disabled={
                    !(
                      isNameValid &&
                      isPasswordValid &&
                      isPasswordMatching &&
                      checked
                    )
                  }>
                  Continue
                </IonButton>
                <IonButton
                  shape="round"
                  color="light"
                  expand="block"
                  className="h-auto my-4"
                  href="/tabs/crypto">
                  Cancel
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </form>
      </CustomPage>
    </IonPage>
  );
};

export default CreateWallet;
