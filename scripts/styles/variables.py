DEFAULT_CSS = "variables.css"
ROOT = ":root"
ROOT_PATH = "../../src/theme/styles/light.css"
BODY_DARK = "body.dark"
DARK_CSS_PATH = "../../src/theme/styles/dark.css"
BODY_DARK_IOS = ".ios body.dark"
DARK_IOS_CSS_PATH = "../../src/theme/styles/ios.css"
BODY_DARK_MD = ".md body.dark"
DARK_MD_CSS_PATH = "../../src/theme/styles/md.css"

## CSS variables match, ionic <-> tailwind, TODO: move to json
VARS_MAP = {
    # Primary
    "--ion-color-primary": "primary",
    "--ion-color-primary-contrast": "primary-content",
    "--ion-color-primary-shade": "primary-focus",
    # Secondary
    "--ion-color-secondary": "secondary",
    "--ion-color-secondary-contrast": "secondary-content",
    "--ion-color-secondary-shade": "secondary-focus",
    # Tertiary
    "--ion-color-tertiary": "tertiary",
    "--ion-color-tertiary-contrast": "tertiary-content",
    "--ion-color-tertiary-shade": "tertiary-focus",
    # Success
    "--ion-color-success": "success",
    "--ion-color-success-contrast": "success-content",
    "--ion-color-success-shade": "success-focus",
    # Warning
    "--ion-color-warning": "warning",
    "--ion-color-warning-contrast": "warning-content",
    "--ion-color-warning-shade": "warning-focus",
    # Error
    "--ion-color-danger": "error",
    "--ion-color-danger-contrast": "error-content",
    "--ion-color-danger-shade": "error-focus",
    # Medium
    "--ion-color-medium": "medium",
    "--ion-color-medium-contrast": "medium-content",
    "--ion-color-medium-shade": "medium-focus",
    # Light
    "--ion-color-light": "light",
    "--ion-color-light-contrast": "light-content",
    "--ion-color-light-shade": "light-focus",
    # Dark
    "--ion-color-dark": "dark",
    "--ion-color-dark-contrast": "dark-content",
    "--ion-color-dark-shade": "dark-focus"
}

PLUGINS = [
    "daisyui"
]
