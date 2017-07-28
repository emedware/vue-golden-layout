const {FuseBox, JSONPlugin, TypeScriptHelpers, UglifyJSPlugin, CSSPlugin, EnvPlugin, QuantumPlugin, VuePlugin, HTMLPlugin} = require("fuse-box");
const fuse = FuseBox.init({
	homeDir: "src",
	output: "dist/$name.js",
	cache: false,
	//debug: true,
	sourceMaps: true,
	plugins: [
		TypeScriptHelpers(),
		//EnvPlugin({NODE_ENV: production ? "production" : "development"}),
		CSSPlugin(),
		//production && UglifyJSPlugin(),
		VuePlugin(),
		HTMLPlugin(),
		JSONPlugin(),
		QuantumPlugin()
	],
	package: {
		name: "vue-golden-layout",
		main: 'index.ts'
	},
	alias: {
		vue: 'vue/dist/vue.common.js'
	},
	globals: {
		'vue-golden-layout': '*'
	}
});
fuse.bundle("vue-golden-layout")
	.watch()
	.instructions('> [index.ts]');

fuse.run();
