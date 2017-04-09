// ./node_modules/webpack/bin/webpack.js

module.exports = {
	entry: { 
		demo: "./src/demo.js",
		umd: "./src/createUMD.js"
	},
	output: {
		filename: "[name].bundle.js",
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
	}
};