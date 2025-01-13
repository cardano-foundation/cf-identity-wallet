module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: "> 0.25%, not dead, Android >= 5",
        useBuiltIns: "entry",
        corejs: 3,
      }
    ]
  ],
  plugins: [
    "@babel/plugin-transform-runtime"
  ]
};
