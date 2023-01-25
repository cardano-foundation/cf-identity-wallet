import React, {useRef} from 'react';
import {useEffect} from 'react';
// @ts-ignore
import {BrowserRouter as Router, useLocation} from 'react-router-dom';
import {IonApp, IonContent, IonPage} from '@ionic/react';
import AppWrapper from '../components/AppWrapper';
// @ts-ignore
import {getRouter} from '../store/selectors';
import {Messaging} from '../api/background/messaging';
import Enable from './components/Enable';

const MainRoutes = () => {
  const controller = Messaging.createInternalController();
  const [request, setRequest] = React.useState(null);

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

  const init = async () => {
    setRequest(await controller.requestData());
    console.log('req');
    console.log(request);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {}, [location]);

  const renderPage = () => {
    console.log('renderPage');
    console.log(request);
    return (
      <Enable
        request={request}
        controller={controller}
      />
    );
  };

  return (
    <IonApp>
      <AppWrapper>
        <IonPage>{renderPage()}</IonPage>
      </AppWrapper>
    </IonApp>
  );
};

function InternalApp() {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
}

export default InternalApp;
