import React from 'react';
import SafeArea from 'react-safe-area-component';
import ReactDOM from 'react-dom/client';
import App from '../App';
import {defineCustomElements} from '@ionic/pwa-elements/loader';
import {Provider} from 'react-redux';
import {I18nextProvider} from 'react-i18next';
import i18n from '../i18n';
import {store} from '../store/store';
import {BrowserRouter} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root-popup'));
root.render(
  <React.StrictMode>
    <SafeArea
      top
      bottom>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <div style={{height: '750px', width: '450px'}}>
            <BrowserRouter>
              <App isExtension={true} />
            </BrowserRouter>
          </div>
        </I18nextProvider>
      </Provider>
    </SafeArea>
  </React.StrictMode>
);

// Enable PWA
defineCustomElements(window);

// Service worker
if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
