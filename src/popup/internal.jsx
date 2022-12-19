import React from 'react';
import SafeArea from 'react-safe-area-component'
import ReactDOM from 'react-dom/client';
import InternalApp from './InternalPage';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Toast } from '@capacitor/toast';
import '../resources/style.css';
import 'tw-elements';
import {I18nextProvider} from 'react-i18next';
import i18n from '../i18n';

const root = ReactDOM.createRoot(document.getElementById('root-internal'));
root.render(
   <React.StrictMode>
      <SafeArea top bottom>
         <I18nextProvider i18n={ i18n }>
            <InternalApp isExtentsion={true} />
         </I18nextProvider>
      </SafeArea>
   </React.StrictMode>
);

// Enable PWA
defineCustomElements(window);


// Web
if (Capacitor.getPlatform() === 'web') {

   // get console.log error on web
   let origin = console.error;
   origin = (error) => {
      if (/Loading chunk [\d]+ failed/.test(error.message)) {
         alert('A new version released. Need to reload the page to apply changes.')
         window.location.reload();
      } else {
         origin(error);
      }
   }
}

// Capacitor App
if (Capacitor.getPlatform() !== 'web') {

   // Display content under transparent status bar (Android only)
   StatusBar.setOverlaysWebView({ overlay: true });

   // Handle back button on capacitor app
   let timePeriodToExit = 3000; // ms
   let countBack = 0;
   let firstBack = 0;
   let secondBack = 0;
   CapacitorApp.addListener('backButton', ({ canGoBack }) => {

      if (!canGoBack) {
         CapacitorApp.exitApp();
      } else {
         window.history.back();
      }

      countBack++
      if (countBack === 1) {
         firstBack = new Date().getTime();
      }
      if (countBack === 2) {
         secondBack = new Date().getTime();
         if (secondBack - firstBack < timePeriodToExit) {
            const c = confirm(
               'Do you want to exit?',
            );
            if (c) {
               CapacitorApp.exitApp();
            } else {
               countBack = 0;
            }
         }
      }
   })

   // Create channel android/ios only
   const notificationChannel = {
      id: 'pop-notifications',// id must match android/app/src/main/res/values/strings.xml's default_notification_channel_id
      name: 'Pop Notifications',
      description: 'Pop Notifications',
      importance: 5,
      visibility: 1,
      lights: true,
      vibration: true,
   };

   LocalNotifications.createChannel(notificationChannel)
   // PushNotifications.createChannel(notificationChannel)
}

// Handle notification
const handleNotifications = async () => {

   // const channelList = { "channels": [{ "id": "default", "name": "Default", "description": "Default", "importance": 3, "visibility": -1000, "sound": "content://settings/system/notification_sound", "vibration": false, "lights": false, "lightColor": "#000000" }, { "id": "pop-notifications", "name": "Pop Notifications", "description": "Pop Notifications", "importance": 0, "visibility": -1000, "sound": "content://settings/system/notification_sound", "vibration": true, "lights": true, "lightColor": "#000000" }] }

   let popNotif = false
   if (Capacitor.getPlatform() !== 'web') {
      const listChannel = await LocalNotifications.listChannels();
      const channels = listChannel.channels
      const print = channels.filter(channels => channels.id === 'pop-notifications');

      if (JSON.stringify(print[0].importance) > 0) {
         popNotif = true
      }
   } else {
      popNotif = true
   }

   const permission = await LocalNotifications.checkPermissions();
   if (popNotif && permission.display === 'granted') {
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
         Toast.show({ text: 'You got a new notification!' });
      })
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
         Toast.show({ text: `Notification: ${JSON.stringify(notification.notification.body)}` });
      })
   } else {
      await LocalNotifications.requestPermissions();
   }
}
handleNotifications();

// Service worker
if (process.env.NODE_ENV === 'production') {
   if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
         navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
         }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
         });
      });
   }
}
