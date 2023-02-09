# ID Wallet

## Usage
```bash
    nvm use 16.10.0
    npm run dev
```

Incase of fatal error: 'vips/vips8' file not found:

```bash
    brew info vips
```

```bash
    brew reinstall vips
    brew install pkg-config glib zlib
    brew install libjpeg-turbo libpng webp
```
#### Mobile
```bash
    brew install cocoapods
```

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
