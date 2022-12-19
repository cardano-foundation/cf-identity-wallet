import React from "react";
import { Camera as CapacitorCamera, CameraResultType } from '@capacitor/camera';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function Camera() {
   askUser();
};


export const askUser = () => {
   confirmAlert({
      title: 'Confirm Action',
      message: 'Do you want to open camera?',
      buttons: [
         {
            label: 'Yes',
            onClick: () => scanCamera()
         },
         {
            label: 'No',
            onClick: () => false,
         }
      ]
   });
};

export const scanCamera = async () => {
   const image = await CapacitorCamera.getPhoto({
      quality: 90,
      correctOrientation: true,
      saveToGallery: true,
      resultType: CameraResultType.Uri
   });

   // image.webPath will contain a path that can be set as an image src.
   // You can access the original file using image.path, which can be
   // passed to the Filesystem API to read the raw data of the image,
   // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
   var imageUrl = image.webPath;
   alert(imageUrl);

   // Can be set to the src of an image now
   imageElement.src = imageUrl;
};