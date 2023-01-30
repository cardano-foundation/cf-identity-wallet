import React, {useRef, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from '@ionic/react';
import {addOutline, ellipsisVertical} from 'ionicons/icons';
import CustomPage from '../../../main/CustomPage';
import WalletButtons from './WalletButtons';
import './Crypto.css';

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

  const openModal = () => {
    nav.push(nav.location.pathname + '?modalOpened=true');
  };

  const closeModal = () => {
    nav.replace('/tabs/crypto');
    setShowAddWallet(false);
  };

  function onWillDismiss(ev) {
    closeModal();
  }

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
          openModal();
        }}>
        <IonModal
          isOpen={showAddWallet}
          ref={modal}
          trigger="open-create"
          onWillDismiss={(ev) => onWillDismiss(ev)}
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
