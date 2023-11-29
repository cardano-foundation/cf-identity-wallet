let { merge } = require("webpack-merge");

module.exports = merge(require("./webpack.common.cjs"), {
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

   ]
});
