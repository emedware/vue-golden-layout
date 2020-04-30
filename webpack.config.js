var path = require("path"),
	externals = require("webpack-node-externals"),
	DtsBundlePlugin = require("./dts-bundle-plugin"),
	VueLoader = require("vue-loader");

module.exports = {
	mode: "development",	//This is meant to be bundled afterward anyway
	context: path.resolve(__dirname, "src"),
	entry: {
		"vue-golden-layout": "./index.ts",
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
		libraryTarget: "umd",
		library: "vue-golden-layout",
		umdNamedDefine: true
	},
	plugins: [
		new DtsBundlePlugin({
			name: "vue-golden-layout",
			main: "dist/index.d.ts",
			baseDir: 'dist',
			out: "vue-golden-layout.d.ts",
			removeSource: true
		}, {
			"golden.d.ts": "golden.vue.d.ts",
			"utils.js.d.ts": "utils.d.ts"
		}),
		new VueLoader.VueLoaderPlugin()
	],
	externals: [
		externals()
	],
	devtool: "source-map",
	module: {
		rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			loader: "ts-loader",
			options: {
				appendTsSuffixTo: [/\.vue$/]
			}
		}, {
			test: /\.css$/,
			loader: "style-loader!css-loader"
		}, {
			enforce: "pre",
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: "source-map-loader"
		}, {
			test: /\.vue$/,
			loader: "vue-loader",
			options: {
				loaders: {
					ts: "ts-loader"
				}
			}
		}]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".html", ".vue"]
	}
};