const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
   entry:{
      main: path.join(__dirname, "src", "index.jsx"),
   },
   experiments: {
      asyncWebAssembly: true,
      syncWebAssembly: true
   },
   module: {
      rules: [
         {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
               loader: "babel-loader",
               options: {
                  presets: ["@babel/preset-env", "@babel/preset-react", ['@babel/preset-typescript', { allowNamespaces: true }]],
               },
            },
         },
         {
            test: /\.(png|jpe?g|gif|svg|webp)$/i,
            use: [
               {
                  loader: "optimized-images-loader",
                  options: {
                     includeStrategy: 'react',
                     // see below for available options in > https://github.com/cyrilwanner/optimized-images-loader
                  },
               },
            ],
         },
         {
            test: /\.css$/i,
            include: path.resolve(__dirname, 'src'),
            use: ['style-loader', 'css-loader', 'postcss-loader'],
         },
      ],
   },
   resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'],
      fallback: {
         crypto: require.resolve('crypto-browserify'),
         stream: require.resolve('stream-browserify'),
         buffer: require.resolve('buffer/'),
         https: require.resolve("https-browserify")
      }
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
         patterns: [
            { from: "public" }
         ],
      }),
      new CopyPlugin({
         patterns: [
            {
               from: 'public/manifest.json',
               to: path.join(__dirname, 'build'),
               force: true,
               transform: function (content, path) {
                  // generates the manifest file using the package.json informations
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
      new webpack.ProvidePlugin({
         Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.DefinePlugin({
         VERSION: JSON.stringify(require("./package.json").version)
      })
   ],
   infrastructureLogging: {
      level: 'info',
   },
};

module.exports = config;
