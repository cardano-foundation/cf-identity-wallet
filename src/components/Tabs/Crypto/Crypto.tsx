import React, {useEffect, useRef, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
  IonButton,
  IonIcon,
  IonModal,
  IonContent,
} from '@ionic/react';
import {addOutline, ellipsisVertical} from 'ionicons/icons';
import CustomPage from '../../../main/CustomPage';
import './Crypto.css';
import {subscribe} from '../../../utils/events';

const Crypto = (props) => {
  const pageName = 'My Wallets';
  const wallets = [
    {name: 'Wallet #1'},
    {name: 'Wallet #2'},
    {name: 'Wallet #3'},
  ];
  const nav = useHistory();
  const modal = useRef(null);
  const [showAddWallet, setShowAddWallet] = useState(false);

  useEffect(() => {
    subscribe('ionBackButton', () => {
      nav.replace('/tabs/crypto');
    });
  }, []);

  const renderWallets = (wallets) => {
    return wallets.map((wallet, index) => (
      <IonRow
        className="ion-text-center"
        key={index}>
        <IonCol>
          <IonButton
            size="large"
            color="dark"
            expand="full">
            <span className="wallet_button">
              {wallet.name}
              <IonIcon icon={ellipsisVertical} />
            </span>
          </IonButton>
        </IonCol>
      </IonRow>
    ));
  };

  const history = useHistory();

  const handleNavigation = (route: string) => {
    setShowAddWallet(false);
    history.push({
      pathname: route,
    });
  };

  const WalletButtons = () => {
    return (
      <IonGrid className="ion-margin buttons_grid">
        <IonRow className="ion-text-center">
          <IonCol>
            <IonButton
              shape="round"
              color="dark"
              expand="block"
              onClick={() => {
                handleNavigation('/createwallet');
              }}
              className="h-auto my-4">
              Create New Wallet
            </IonButton>
            <IonButton
              shape="round"
              color="light"
              expand="block"
              className="h-auto my-4">
              Recover Existing Wallet
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  };

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        actionButton={!!wallets.length}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem"
        actionButtonClickEvent={() => {
          setShowAddWallet(true);
          nav.push(nav.location.pathname + '?modalOpened=true');
        }}>
        <IonModal
          id="create-wallet-modal"
          isOpen={showAddWallet}
          ref={modal}
          trigger="open-create"
          onWillDismiss={() => setShowAddWallet(false)}
          initialBreakpoint={0.6}
          breakpoints={[0, 0.6]}>
          <IonContent className="ion-padding">
            <WalletButtons />
          </IonContent>
        </IonModal>
        {wallets.length ? (
          <IonGrid className="ion-margin">{renderWallets(wallets)}</IonGrid>
        ) : (
          <WalletButtons />
        )}
      </CustomPage>
    </IonPage>
  );
};

export default Crypto;
