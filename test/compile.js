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
				test: /\.scss$/,
				loaders: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
			}, {
				enforce: 'pre',
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "source-map-loader"
			}, {
				enforce: 'pre',
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: "source-map-loader"
			}, {
				test: /\.gif$/,
				loader: "url-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]",
					limit: 10000
				}
			}, {
				test: /\.png$/,
				loader: "url-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]",
					limit: 10000
				}
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
				vue: 'vue/dist/vue.js'
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