# Running in an Emulator
## Building the App
```bash
npm run build
```
## Prepare Capacitor: This command will sync all changes to iOS and Android.
```bash
npm run build:cap
```
## Running on Xcode Emulator
- Install Xcode: Ensure you have the latest version of Xcode installed on your Mac.
- Open the iOS Simulator: Open Xcode, navigate to `Xcode > Open Developer Tool > Simulator`.
- Select the desired iOS Device: Choose an iOS device model from the simulator list.
- Run the Application: In your project directory, execute `npx cap open ios`. This will open your project in Xcode. From here, you can build and run the application on the selected simulator. 
As alternative, you can open the file `App.xcworkspace` directly in Xcode from `ios/App` folder. 

## Running on Android Studio Emulator
- Install Android Studio: Make sure you have the latest version of Android Studio.
- Setup Android Emulator: Open Android Studio, go to `Tools > AVD Manager` and create a new Android Virtual Device (AVD) or select an existing one.
- Run the Application: Navigate to your project directory and run `npx cap open android`. This will open your project in Android Studio. Build and run the application on your chosen emulator.
As alternative, you can open the folder `android` directly in Android Studio.

In addition to using the emulators, you can also run the identity wallet directly on a real mobile device, providing a more authentic user experience and testing environment.  This approach requires the device to be tethered via cable to your computer running Xcode and/or Android Studio and the developer options must be enabled.  For further instructions: [Xcode](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device) and [Android Studio](https://developer.android.com/studio/run/device).