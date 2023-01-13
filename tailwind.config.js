module.exports =
{
    darkMode: 'class',
    important: true,
    theme: {
        extend: {

        },
    },
    content: ["./src/**/*.{js,jsx,ts,tsx}",],
    plugins: [
        require("daisyui")
    ],
    daisyui: {
        styled: true,
        base: true,
        utils: true,
        logs: true,
        rtl: false,
        prefix: "tw-",
        themes: [
            {
                light: {
                    primary: "#a101f7",
                    secondary: "#f6d860",
                    success: "#2fdf75",
                    warning: "#ffd534",
                    error: "#ff4961",
                    info: "#6a64ff"
                },
                dark: {
                    primary: "#a991f7",
                    secondary: "#f6d860",
                    success: "#ffd534",
                    warning: "#ffd534",
                    error: "#ff4961",
                    info: "#6a64ff"
                },
            },
        ],
    },
}
