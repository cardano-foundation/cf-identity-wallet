import React from "react";
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { Toast } from '@capacitor/toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';


export default function Barcode() {
   askUser();
};

export const askUser = () => {
   confirmAlert({
      title: 'Confirm Action',
      message: 'Do you want to scan a barcode?',
      buttons: [
         {
            label: 'Yes',
            onClick: () => checkPermission()
         },
         {
            label: 'No',
            onClick: () => false,
         }
      ]
   });
};

export const startScan = async () => {

   document.body.style.background = "transparent";
   document.querySelector(".hideBg").style.display = "none";
   document.querySelector(".overlayBg").style.display = "block";
   document.querySelector(".overlayBtn").style.display = "block";

   const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE]
   })

   // if the result has content
   if (result.hasContent) {
      alert(result.content)
      this.stopScan()
   }
};

export const stopScan = () => {
   document.body.style.background = "";
   document.querySelector(".hideBg").style.display = "";
   document.querySelector(".overlayBg").style.display = "none";
   document.querySelector(".overlayBtn").style.display = "none";
   BarcodeScanner.stopScan()
};

export const checkPermission = async () => {
   try {
      const status = await BarcodeScanner.checkPermission({ force: true })

      if (status.granted) {
         startScan()
      }

      if (status.denied) {
         // the user denied permission for good
         // redirect user to app settings if they want to grant it anyway
         const c = confirm(
            'If you want to grant permission for scan QR. Please enable it in the app settings.',
         );
         if (c) {
            BarcodeScanner.openAppSettings();
         }
      }

      return false
   } catch (error) {
      Toast.show({ text: error.message });
   }
}