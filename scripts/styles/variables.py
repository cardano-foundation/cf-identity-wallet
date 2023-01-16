
PLUGINS = [
    "daisyui"
]
TAILWIND_TEMPLATE_FILE_PATH = "tailwind.config.template.json"
TAILWIND_CONFIG_FILE_PATH = "../../tailwind.config.js"

CSS_KEY_FILES = [
    {
        "css_key": ":root",
        "file_path": "../../src/theme/styles/light.css",
        "theme_name": "light"
    },
    {
        "css_key": "body.dark",
        "file_path": "../../src/theme/styles/dark.css",
        "theme_name": "dark"
    },
    {
        "css_key": ".ios body.dark",
        "file_path": "../../src/theme/styles/ios.css",
        "theme_name": "dark_ios"
    },
    {
        "css_key": ".md body.dark",
        "file_path": "../../src/theme/styles/md.css",
        "theme_name": "dark_md"
    }
]

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
    "--ion-color-dark-shade": "dark-focus",
    # dark iOS/MD
    "--ion-background-color": "base-100",
    "--ion-text-color": "text-color",
    "--ion-toolbar-background": "toolbar-background",
    "--ion-item-background": "item-background",
    "--ion-border-color": "border-color",
    "--ion-color-step-50": "color-50",
    "--ion-color-step-100": "color-100",
    "--ion-color-step-150": "color-150",
    "--ion-color-step-200": "color-200",
    "--ion-color-step-250": "color-250",
    "--ion-color-step-300": "color-300",
    "--ion-color-step-350": "color-350",
    "--ion-color-step-400": "color-400",
    "--ion-color-step-450": "color-450",
    "--ion-color-step-500": "color-500",
    "--ion-color-step-550": "color-550",
    "--ion-color-step-600": "color-600",
    "--ion-color-step-650": "color-650",
    "--ion-color-step-700": "color-700",
    "--ion-color-step-750": "color-750",
    "--ion-color-step-800": "color-800",
    "--ion-color-step-850": "color-850",
    "--ion-color-step-900": "color-900",
    "--ion-color-step-950": "color-950"

}

SCRIPT_TITLE_1 = "█ █▀█ █▄░█ █ █▀▀ ▄▄▄▄ ▀█▀ ▄▀█ █ █░░ █░█░█ █ █▄░█ █▀▄"
SCRIPT_TITLE_2 = "█ █▄█ █░▀█ █ █▄▄ ░░░░ ░█░ █▀█ █ █▄▄ ▀▄▀▄▀ █ █░▀█ █▄▀"
