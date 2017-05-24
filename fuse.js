const {FuseBox, JSONPlugin, TypeScriptHelpers, UglifyJSPlugin, CSSPlugin, EnvPlugin, VuePlugin, HTMLPlugin} = require("fuse-box");
const fuse = FuseBox.init({
	homeDir: "src",
	output: "dist/$name.js",
	cache: false,
	sourceMaps: true,
	modulesFolder: '..',
	plugins: [
		TypeScriptHelpers(),
		//EnvPlugin({NODE_ENV: production ? "production" : "development"}),
		CSSPlugin(),
		//production && UglifyJSPlugin(),
		VuePlugin(),
		HTMLPlugin(),
		JSONPlugin()
	],
	package: {
		name: "vue-golden-layout",
		main: 'src/index.ts'
	},
	globals: {
		'vue-golden-layout': '*'
	}
});
fuse.bundle("vue-golden-layout")
	.watch()
	.instructions('> index.ts');

fuse.run();
