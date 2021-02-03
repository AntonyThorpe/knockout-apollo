// ./node_modules/webpack/bin/webpack.js
// ./node_modules/webpack/bin/webpack.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        demo: "./demo/src/viewModel.js"
    },
    output: {
		filename: "[name].js",
		path: __dirname + '/dist',
        libraryTarget: "umd"
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
