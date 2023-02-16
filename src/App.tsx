import React, {useRef} from 'react';
import {IonApp, setupIonicReact} from '@ionic/react';
import {useHistory} from 'react-router-dom';
import {useEffect} from 'react';
import Routes from './routes';
import {SideMenuProvider} from './components/navigation/side-menu/SideMenuProvider';
/* Core CSS required for Ionic components to work properly */
import './theme/tailwind.css';
import './theme/ionic.scss';
import './theme/style.scss';
import './theme/structure.css';
import AppWrapper from './components/AppWrapper';
import {HandleConnect} from './api/p2p/HandleConnect';
import {SplashScreen} from '@capacitor/splash-screen';

export const handleConnect = new HandleConnect();

setupIonicReact();

const App = (isExtension?: boolean) => {
  const history = useHistory();

  // TODO: hotfix, refactor extension webpack
  if (isExtension && history) {
    history.push('/');
  }

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
    const init = async () => {
      await SplashScreen.show({
        showDuration: 2000,
        fadeInDuration: 0,
        fadeOutDuration: 0.5,
        autoHide: true,
      });
    };
    if (isMounted.current) {
      init().catch(console.error);
    }
  }, []);

  return (
    <IonApp>
      <AppWrapper>
        <SideMenuProvider>
          <Routes />
        </SideMenuProvider>
      </AppWrapper>
    </IonApp>
  );
};

export default App;
