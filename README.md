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
    npm run build:cap
```

Finally, run the app:

```
    npm run open:ios
    npm run open:android
```

Or open Android Studio:

```
    npx cap open android
```

#### Build Chrome Extension

```
    npm run build:extension
```

#### Rebuild Styles (Tailwind)

```
    npm run build:css
```

### Styles between Ionic and Tailwind
Requirements: install `cssutils` and `jsbeautifier`.

Generate `tailwind.config.js` based on Ionic themes.
```bash
    cd scripts/styles & python sync.py
```
