DEFAULT_CSS = "variables.css"
ROOT = ":root"

DARK_CSS = "dark/default.css"
DARK_IOS_CSS = "dark/ios.css"
DARK_MD_CSS = "dark/md.css"

## CSS variables match, ionic <-> tailwind
CSS_MAP = {
    primary: {
        "--ion-color-primary": "primary",
        "--ion-color-primary-contrast": "primary-content",
        "--ion-color-primary-shade": "primary-focus"
    },
    secondary: {
        "--ion-color-secondary": "secondary",
        "--ion-color-secondary-contrast": "secondary-content",
        "--ion-color-secondary-shade": "secondary-focus"
    },
    tertiary: {
        "--ion-color-tertiary": "tertiary",
        "--ion-color-tertiary-contrast": "tertiary-content",
        "--ion-color-tertiary-shade": "tertiary-focus"
    },
    success: {
        "--ion-color-success": "success",
        "--ion-color-success-contrast": "success-content",
        "--ion-color-success-shade": "success-focus"
    },
    warning: {
        "--ion-color-warning": "warning",
        "--ion-color-warning-contrast": "warning-content",
        "--ion-color-warning-shade": "warning-focus"
    },
    danger: {
        "--ion-color-danger": "error",
        "--ion-color-danger-contrast": "error-content",
        "--ion-color-danger-shade": "error-focus"
    },
    dark: {
        "--ion-color-dark": "info",
        "--ion-color-dark-contrast": "dark-content",
        "--ion-color-dark-shade": "dark-focus"
    },
    medium: {
        "--ion-color-medium": "medium",
        "--ion-color-medium-contrast": "medium-content",
        "--ion-color-medium-shade": "medium-focus"
    },
    light: {
        "--ion-color-light": "light",
        "--ion-color-light-contrast": "light-content",
        "--ion-color-light-shade": "light-focus"
    }
}
