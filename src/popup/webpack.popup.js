const path = require("path");
const Dotenv = require('dotenv-webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
let { merge } = require("webpack-merge");

module.exports = merge(require("./webpack.config.js"), {
   mode: "production",
   output: {
      publicPath:path.resolve(__dirname, "../../", "build-extension"),
      path: path.resolve(__dirname, "../../","build-extension"),
      filename: '[name].bundle.js',
   },
   module: {
      rules: [
         {
            test: /\.s[ac]ss$/i,
            use: [
               {
                  loader: MiniCssExtractPlugin.loader,
               },
               {
                  loader: 'css-loader',
                  options: { url: false }
               },
               {
                  loader: 'sass-loader',
               },
            ],
         },
      ],
   },
   devtool: "source-map",
   plugins: [
      new Dotenv({
         path: path.resolve(__dirname, "../", ".env.production"), // load this now instead of the ones in '.env'
      }),
      new WorkboxPlugin.GenerateSW({
         // these options encourage the ServiceWorkers to get in there fast
         // and not allow any straggling "old" SWs to hang around
         clientsClaim: true,
         skipWaiting: true,
         maximumFileSizeToCacheInBytes: 5000000,
      }),
      new MiniCssExtractPlugin({
         filename: 'styles.[fullhash].min.css',
      }),
   ],
   optimization: {
      minimizer: [
         new CssMinimizerPlugin()
      ],
      minimize: true,
   },
});
