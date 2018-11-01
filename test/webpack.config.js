var webpack = require("webpack"),
	path = require("path"),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
    VueLoader = require('vue-loader');
module.exports = {
	mode: 'development',
	optimization: {
		minimize: false
	},
	devtool: 'eval',
	entry: {
		app: [path.resolve(__dirname, './index.ts')]
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, "dist"),
		chunkFilename: "[chunkhash].js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'test/index.ejs',
			title: 'vue-golden-layout'
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
	}
};