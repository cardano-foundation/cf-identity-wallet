import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
   appId: "com.idwallet",
   appName:  "ID Wallet",
   webDir: "build",
   bundledWebRuntime: true,
   plugins: {
      SplashScreen: {
         backgroundColor: "#488AFF"
      },
      LocalNotifications: {
         smallIcon: "ic_stat_icon_config_sample",
         iconColor: "#488AFF",
         sound: "beep.wav"
      }
   },
   //server: {
   //   url: "http://192.168.31.17:3001",
   //   cleartext: true
   //}
};

export default config;
