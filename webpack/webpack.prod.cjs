const path = require("path");
const WorkboxPlugin = require('workbox-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
let { merge } = require("webpack-merge");

module.exports = merge(require("./webpack.common.cjs"), {
   mode: "production",
   output: {
      path: path.resolve(__dirname, "..", "build"),
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
