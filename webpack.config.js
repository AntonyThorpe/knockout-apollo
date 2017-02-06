// ./node_modules/webpack/bin/webpack.js

module.exports = {
	entry: "./js/main.js",
	output: {
		path: "js",
		filename: "bundle.js"
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
	}
};