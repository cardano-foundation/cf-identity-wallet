# ID Wallet

## Usage
```bash
    nvm use 18
    npm i
    npm run dev
```

#### Mobile

```bash
    yarn buildcap
```

Finally, run the app:

```
    npx cap run ios
    npx cap run android
```

Or open Android Studio:

```
    npx cap open android
```

### Styles between Ionic and Tailwind
Requirements: install `cssutils` and `jsbeautifier`.

Generate `tailwind.config.js` based on Ionic themes.
```bash
    cd scripts/styles & python sync.py
```
