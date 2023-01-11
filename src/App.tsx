import React, { useRef } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import NavRoutes from './main/nav/NavRoutes';
import { SideMenuProvider } from './main/SideMenuProvider';

setupIonicReact();
/* Core CSS required for Ionic components to work properly */
import './theme/App.scss';
import './theme/variables.css';
import './theme/structure.css';

const App = (isExtension?: boolean) => {
  const history = useHistory();

  if (isExtension && history) {
    console.log('isExtension44');
    console.log(window.location.pathname);
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
    const init = async () => {};
    if (isMounted.current) {
      init().catch(console.error);
    }
  }, []);

  return (
    <IonApp>
      <SideMenuProvider>
        <NavRoutes />
      </SideMenuProvider>
    </IonApp>
  );
};

export default App;
