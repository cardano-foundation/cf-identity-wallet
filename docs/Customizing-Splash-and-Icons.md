## Splashscreen and Icons

To customize the app icons and splash screens, the Identity Wallet uses the [@capacitor/assets](https://github.com/ionic-team/capacitor-assets) package.

### Steps to Customize

1. **Replace Default Assets**  
   Replace the default icons and splash screens in the `./src/assets` folder with your custom assets.  

   - **For Android:**  
     Place custom assets in the `./src/assets/android` folder. This addresses the issue of default Android icons appearing too small due to excessive padding in the logos. By using assets with reduced padding in this folder, the icons will appear larger on Android.

2. **Generate Required Resources**  
   Run the following commands to generate platform-specific resources:

   - **For iOS:**
     ```bash
     npx capacitor-assets generate --ios --asset-path ./src/assets
     ```

   - **For Android:**
     ```bash
     npx capacitor-assets generate --android --asset-path ./src/assets/android
     ```

This will generate the icons and splash screens for the respective platforms.  

For more details, refer to the [Splash Screens and Icons Capacitor Documentation](https://capacitorjs.com/docs/guides/splash-screens-and-icons).

As the last step, we should also replace the favicon (which the user will never see, but the devs will for sure when they work on the app and preview it on the browser). This is a manual process and the file is:

```./public/favicon.ico```
