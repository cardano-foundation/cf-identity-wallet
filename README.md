# ID Wallet
An open-source Decentralised Identity (DID) and Verifiable Credential (VC) Wallet complying to W3C and DIDComm standards utilising Local-First Software design and development principles.  The wallet also features a bespoke Cardano Crypto Wallet. 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `npm run start-appium`

When you run the appium command, it starts the Appium server, which listens for incoming connections on a specified port. In this case, the --port 4003 option is used to specify that the Appium server should listen on port 4003.

### `npm run e2e:web`

Runs the WebdriverIO test runner with the provided TypeScript configuration file in watch mode, continuously executing the tests and monitoring for changes in the test files or configuration. The SERVE_PORT and TS_NODE_PROJECT environment variables are set to specify the server port and TypeScript configuration, respectively.

#### How to run the end2ends in local

1. Start Appium server in terminal A:
   `npm run start-appium`
2.  Run the web server in terminal B:
    `npm run dev`
3. Run the test in terminal C:
    `npm run e2e:web`


See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
