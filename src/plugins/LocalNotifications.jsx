import React from "react";
import { LocalNotifications } from '@capacitor/local-notifications';
import { confirmAlert } from "react-confirm-alert";
import { Capacitor } from "@capacitor/core";


export const showLocalNotification = async () => {

   try {
      const permission = await LocalNotifications.requestPermissions();
      const id = new Date().getTime();
      if (permission.display == 'granted') {

         // register action on capacitor
         if (Capacitor.getPlatform() !== 'web') {
            await LocalNotifications.registerActionTypes({
               types: [
                  {
                     id: 'CHAT_ACTION',
                     actions: [
                        {
                           id: "view",
                           title: 'Open Chat'
                        },
                        {
                           id: "remove",
                           title: 'Dismiss',
                           destructive: true
                        }
                     ]
                  }
               ]
            })
         }

         const res = await LocalNotifications.schedule({
            notifications: [
               {
                  title: "Title",
                  smallIcon: 'logo',
                  largeIcon: 'splash',
                  body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum nisi delectus molestias, blanditiis,",
                  // largeBody: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, eaque fuga aliquam ratione rem excepturi accusantium voluptatibus, commodi fugiat, porro pariatur quisquam veritatis totam sunt modi sequi cum debitis assumenda?",
                  id: id,
                  channelId: 'pop-notifications',
                  sound: true,
                  attachments: [{ id: id, url: 'res://assets/img/splash.png', options: {} }],
                  // actionTypeId: "CHAT_ACTION",
               }
            ]
         });
         //console.log(res);
      } else {
         confirmAlert({
            title: 'Permission Needed',
            message: "Please accept notification permission",
            buttons: [
               {
                  label: 'Close',
                  onClick: () => false,
               }
            ]
         });
      }

   } catch (error) {
      alert(error.message);
   }

};