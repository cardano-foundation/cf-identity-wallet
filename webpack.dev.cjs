let { merge } = require("webpack-merge");
const webpack = require("webpack");

module.exports = merge(require("./webpack.common.cjs"), {
   mode: "development",
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
                  options: {
                     api: "modern",
                  },
               },
            ],
         },
         {
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
            resolve: {
              fullySpecified: false,
            },
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
      new webpack.DefinePlugin({
         "process.env.NODE_ENV": JSON.stringify("development"),
      }),
      {
         apply: (compiler) => {
            compiler.hooks.compile.tap('[Warning] ', () => {
               const keriaIP = process.env.KERIA_IP;
               if (keriaIP) {
                  console.warn(`⚠️ You are running the development server with the KERIA_IP=${keriaIP} environment variable set ⚠️`);
               }
            });
         }
      },
   ],
   optimization: {
      minimize: false,
    },
});
