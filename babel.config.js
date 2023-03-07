module.exports = {
    presets: [
        [
            "@babel/preset-react",
            {
                targets: {
                    node: "current",
                },
            },
        ],
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "entry"
            },
        ],
        '@babel/preset-typescript'
    ],
}
