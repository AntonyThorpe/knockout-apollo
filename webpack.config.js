// ./node_modules/webpack/bin/webpack.js
const webpack = require('webpack');

if (process.env.NODE_ENV === "production") {
	var file_name_suffix = ".umd.bundle.min.js";
} else {
	var file_name_suffix = ".umd.bundle.js";
}

module.exports = {
	entry: {
		"apollo-client": "./src/apollo-client.js",
		"subscription-transport-ws": "./src/subscription-transport-ws.js",
		//onlinedemo: "./src/onlinedemo.js",  - need a new endpoint so skip
	},
	output: {
		filename: "[name]" + file_name_suffix,
		path: __dirname + '/dist',
		libraryTarget: "umd",
		umdNamedDefine: true
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /(node_modules)/,
			loader: "babel-loader",
			query: {
				presets: [
					"es2015"
				]
			}
		}]
	},
	plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
	]
};