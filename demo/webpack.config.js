var webpack = require("webpack"),
	path = require("path"),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	VueLoader = require('vue-loader');
module.exports = {
	mode: 'development',
	devtool: 'eval',
	entry: {
		app: [path.resolve(__dirname, './index.ts'), 'webpack-dev-server-status-bar']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, "dist"),
		chunkFilename: "[chunkhash].js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './index.ejs'),
			favicon: path.resolve(__dirname, './favicon.ico'),
			title: 'vue-golden-layout-demo'
		}),
		new VueLoader.VueLoaderPlugin()
	],
	module: {
		rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			loader: 'ts-loader',
			options: {
				appendTsSuffixTo: [/\.vue$/]
			}
		}, {
			test: /\.css$/,
			loader: "style-loader!css-loader"
		}, {
			enforce: 'pre',
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: "source-map-loader"
		}, {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {
				loaders: {
					ts: 'ts-loader'
				}
			}
		}]
	},
	resolve: {
		alias: {
			vue: 'vue/dist/vue.esm.js', //route are only given a template and need to be compiled client-side
			'vue-golden-layout': path.resolve(__dirname, '../src/index.ts')
		},
		extensions: [".tsx", ".ts", ".js", '.html', '.vue']
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 9000,
		overlay: true,
		historyApiFallback: true,
		stats: {
			colors: true
		}
	}
};