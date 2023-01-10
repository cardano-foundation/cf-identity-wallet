import React, { useRef } from 'react';
import { setupIonicReact } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';

setupIonicReact();
/* Core CSS required for Ionic components to work properly */
import './theme/App.scss';
import './theme/variables.css';
import './theme/structure.css';
import './theme/custom-tab-bar.css';

const App = (isExtension?: boolean) => {
  const history = useHistory();

  if (isExtension && history) {
    console.log('isExtension44');
    console.log(window.location.pathname);
    history.push('/');
  }

  console.log('window.location.pathname2');
  console.log(window.location.pathname);

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

  return <>Test</>;
};

export default App;
