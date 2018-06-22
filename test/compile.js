var webpack = require("webpack"),
	path = require("path"),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
devCompiler = webpack({
	devtool: 'inline-source-map',
	entry: {
		app: [path.resolve(__dirname, './index.ts')]
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, "../dist"),
		chunkFilename: "[chunkhash].js"
	},
	plugins: [
		//https://github.com/jantimon/html-webpack-plugin
		new HtmlWebpackPlugin({
			template: 'test/index.ejs',
			title: 'vue-golden-layout'
		})
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
			vue: 'vue/dist/vue.esm.js'
		},
		extensions: [".tsx", ".ts", ".js", '.html', '.vue']
	}
});

devCompiler.run(function(err, stats) {
	if(err) throw err;
	console.log(stats.toString({
		colors: true
	}));
});