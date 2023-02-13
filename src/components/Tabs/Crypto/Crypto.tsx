import React, {useEffect, useRef, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
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
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import './Crypto.css';
import {subscribe} from '../../../utils/events';
import {
  getCachedAccounts,
  setAccountsIdsInCache,
} from '../../../store/reducers/cache';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {Account} from '../../../models/Account/Account';

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
      // call the function
      init()
        // make sure to catch any error
        .catch(console.error);
    }
  }, []);

  const removeWallet = async (id: string) => {
    console.log('removeWallet');
    console.log(id);
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
              <div className="py-2">
                <IonItem className="w-full">
                  <IonRow className={'pl-4'}>
                    <IonLabel className="font-extrabold w-full">
                      {wallet}
                    </IonLabel>

                    <IonLabel className="text-sm">ADA {0}</IonLabel>
                  </IonRow>
                  <IonIcon
                    id={`popover-button-${wallet}`}
                    icon={ellipsisVertical}
                    className="float-right"
                    slot="end"
                  />
                </IonItem>
                <IonPopover
                  className="scroll-y-hidden"
                  trigger={`popover-button-${wallet}`}
                  dismissOnSelect={true}
                  size={'auto'}
                  side="bottom"
                  ref={popover}
                  isOpen={popoverOpen}
                  onDidDismiss={() => setPopoverOpen(false)}>
                  <>
                    <IonRow>
                      <IonItem
                        className="px-4 py-2"
                        onClick={() => {}}>
                        <IonIcon
                          slot="start"
                          icon={informationCircleOutline}
                        />
                        <IonLabel> More details</IonLabel>
                      </IonItem>
                    </IonRow>
                    <IonRow>
                      <IonItem className="px-4 py-2">
                        <IonIcon
                          slot="start"
                          icon={copyOutline}
                        />
                        <IonLabel> Copy Address</IonLabel>
                      </IonItem>
                    </IonRow>
                    <IonRow>
                      <IonItem
                        className="px-4 py-2"
                        onClick={() => removeWallet(wallet)}>
                        <IonIcon
                          slot="start"
                          icon={trashOutline}
                        />
                        <IonLabel>Delete</IonLabel>
                      </IonItem>
                    </IonRow>
                  </>
                </IonPopover>
              </div>
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
