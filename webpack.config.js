var webpack = require("webpack"),
	path = require("path"),
	externals = require('webpack-node-externals'),
	{default: DtsBundlePlugin} = require('webpack-dts-bundle'),
	VueLoader = require('vue-loader');

module.exports = {
	mode: 'development',	//This is meant to be bundled afterward anyway
	entry: {
		'vue-golden-layout': [path.resolve(__dirname, 'src/index.ts')],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, "dist"),
		libraryTarget: 'umd',
		library: 'vue-golden-layout',
		umdNamedDefine: true,
		libraryExport: 'default'
	},
	plugins: [
		new DtsBundlePlugin({
			name: 'vue-golden-layout',
			main: 'dist/index.d.ts',
			out: 'vue-golden-layout.d.ts',
			removeSource: true
		}),
		new VueLoader.VueLoaderPlugin()
	],
	externals: [
		externals()
	],
	devtool: 'source-map',
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
		extensions: [".tsx", ".ts", ".js", '.html', '.vue']
	}
};