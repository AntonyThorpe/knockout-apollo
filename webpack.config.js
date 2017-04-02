// ./node_modules/webpack/bin/webpack.js

module.exports = {
	entry: "./demojs/main.js",
	output: {
		filename: "./demojs/bundle.js"
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