const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
require("dotenv").config({ path: "./.env" });
const config = {
  entry: {
    main: path.join(__dirname, "src", "index.tsx"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        }
      },
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.ya?ml$/,
        use: "yaml-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".tsx", ".ts"],
    fallback: {
      fs: false,
    },
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: true,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
    }),
    new CopyPlugin({
      patterns: [{ from: "public" }],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "public", "manifest.json"),
          to: path.join(__dirname, "build"),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json information
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version),
      "process.env": JSON.stringify(process.env)
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new NodePolyfillPlugin(),
  ],
  infrastructureLogging: {
    level: "info",
  },
  experiments: {
    asyncWebAssembly: true,
  },
};

module.exports = config;
