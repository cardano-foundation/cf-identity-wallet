import React from 'react'
import { askUser as askUserBarcode, stopScan as stopScanBarcode } from "./Barcode";
import { askUser as askUserCamera } from "./Camera";
import { getCurrentPosition, watchPosition } from './Geolocation';
import { showLocalNotification } from './LocalNotifications';

export default function ListPlugin() {
   return (
      <>
         <div id="content">
            <div className='row'>
               <div className='col-md-4 mb-5'>
                  <button className="rn-btn text-center py-5" onClick={askUserBarcode} >
                     <span>Scan Barcode</span>
                  </button>
               </div>
               <div className='col-md-4 mb-5'>
                  <button className="rn-btn text-center py-5" onClick={askUserCamera} >
                     <span>Open Camera</span>
                  </button>
               </div>
               <div className='col-md-4 mb-5'>
                  <button className="rn-btn text-center py-5" onClick={getCurrentPosition} >
                     <span>Geolocation</span>
                  </button>
               </div>
               <div className='col-md-4 mb-5'>
                  <button className="rn-btn text-center py-5" onClick={showLocalNotification} >
                     <span>Local Notification</span>
                  </button>
               </div>
            </div>
         </div>
      </>
   )
}