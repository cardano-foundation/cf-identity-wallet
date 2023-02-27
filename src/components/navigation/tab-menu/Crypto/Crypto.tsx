import React, {useEffect, useRef, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonPopover,
  IonRow,
} from '@ionic/react';
import {
  addOutline,
  copyOutline,
  ellipsisVertical,
  informationCircleOutline,
  trashOutline,
} from 'ionicons/icons';
import CustomPage from '../../../layouts/PageLayout';
import {useSideMenuUpdate} from '../../side-menu/SideMenuProvider';
import './Crypto.css';
import {subscribe} from '../../../../utils/events';
import {
  getCachedAccounts,
  setAccountsIdsInCache,
} from '../../../../store/reducers/cache';
import {useAppDispatch, useAppSelector} from '../../../../store/hooks';
import {Account} from '../../../../models/Account/Account';

const Crypto = (props: any) => {
  const pageName = 'My Wallets';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();
  const nav = useHistory();
  const dispatch = useAppDispatch();
  const modal = useRef(null);
  const cachedAccounts = useAppSelector(getCachedAccounts);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  // TODO: Crypto wallet logo upload
  const logo = ''; // Placeholder for future logo url

  useEffect(() => {
    if (props.location.pathname === '/tabs/crypto') {
      setSideMenu({
        options: sideMenuOptions,
        pageName: pageName,
      });
    }
  }, [props.location]);

  const useIsMounted = () => {
    const isMounted = useRef(false);

    // @ts-ignore
    useEffect(() => {
      isMounted.current = true;
      return () => (isMounted.current = false);
    }, []);
    return isMounted;
  };

  const isMounted = useIsMounted();

  useEffect(() => {
    subscribe('ionBackButton', () => {
      nav.replace('/tabs/crypto');
    });
  }, []);

  useEffect(() => {
    const init = async () => {};
    if (isMounted.current) {
      init().catch(console.error);
    }
  }, []);

  const removeWallet = async (id: string) => {
    Account.removeAccount(id);

    dispatch(setAccountsIdsInCache(cachedAccounts.filter((acc) => acc !== id)));
  };

  const renderWallets = () => {
    return cachedAccounts.map((wallet, index) => (
      <IonRow
        className="ion-text-center"
        key={index}>
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonRow>
                {logo && (
                  <IonCol size="2">
                    <IonAvatar>
                      <img
                        src={logo}
                        className="h-full"
                        alt="Crypto wallet logo"
                      />
                    </IonAvatar>
                  </IonCol>
                )}
                <IonCol size={logo ? '9' : '11'}>
                  <IonItem>
                    <IonRow>
                      <IonLabel className="font-extrabold w-full">
                        {wallet}
                      </IonLabel>
                      <IonLabel className="text-sm">ADA {0}</IonLabel>
                    </IonRow>
                  </IonItem>
                </IonCol>
                <IonCol size="1">
                  <IonIcon
                    id={`popover-button-${wallet}`}
                    icon={ellipsisVertical}
                    className="float-right themed-button"
                  />
                  <IonPopover
                    className="scroll-y-hidden"
                    trigger={`popover-button-${wallet}`}
                    dismissOnSelect={true}
                    size={'auto'}
                    side="bottom"
                    ref={popover}
                    isOpen={popoverOpen}
                    onDidDismiss={() => setPopoverOpen(false)}>
                    <IonContent class="ion-padding">
                      <IonIcon
                        className="align-middle  pr-4"
                        icon={informationCircleOutline}
                      />
                      <IonLabel className="align-middle">More details</IonLabel>
                    </IonContent>
                    <IonContent class="ion-padding">
                      <IonIcon
                        className="align-middle  pr-4"
                        icon={copyOutline}
                      />
                      <IonLabel className="align-middle">Copy Address</IonLabel>
                    </IonContent>
                    <IonContent
                      class="ion-padding"
                      onClick={() => removeWallet(wallet)}>
                      <IonIcon
                        className="align-middle  pr-4"
                        icon={trashOutline}
                      />
                      <IonLabel className="align-middle">Delete</IonLabel>
                    </IonContent>
                  </IonPopover>
                </IonCol>
              </IonRow>
            </IonCardHeader>
          </IonCard>
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
              color="primary"
              expand="block"
              className="h-auto my-4"
              onClick={() => {
                handleNavigation('/createwallet');
              }}>
              Create New Wallet
            </IonButton>
            <IonButton
              shape="round"
              color="medium"
              expand="block"
              className="h-auto my-4"
              onClick={() => {
                handleNavigation('/recoverwallet');
              }}>
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
        sideMenu={true}
        actionButton={!!cachedAccounts.length}
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
        {cachedAccounts?.length ? (
          <IonGrid className="ion-margin">{renderWallets()}</IonGrid>
        ) : (
          <WalletButtons />
        )}
      </CustomPage>
    </IonPage>
  );
};

export default Crypto;
