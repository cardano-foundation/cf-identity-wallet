const path = require("path");
const Dotenv = require('dotenv-webpack');
let { merge } = require("webpack-merge");

module.exports = merge(require("./webpack.common.js"), {
   mode: 'development',
   module: {
      rules: [
         {
            test: /\.s[ac]ss$/i,
            exclude: /node_modules/,
            use: [
               {
                  loader: 'style-loader',
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
   devtool: 'eval-source-map',
   devServer: {
      historyApiFallback: true,
      client: {
         overlay: false
      },
   },
   plugins: [
      new Dotenv({
         path: './.env.development', // load this now instead of the ones in '.env'
      }),
   ]
});
