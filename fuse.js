const {FuseBox, JSONPlugin, CSSPlugin, QuantumPlugin, VueComponentPlugin, HTMLPlugin} = require("fuse-box");
const fuse = FuseBox.init({
	homeDir: "src",
	output: "dist/$name.js",
	cache: false,
	//debug: true,
	sourceMaps: true,
	plugins: [
		//EnvPlugin({NODE_ENV: production ? "production" : "development"}),
		CSSPlugin(),
		VueComponentPlugin(),
		HTMLPlugin(),
		JSONPlugin(),
		QuantumPlugin({
			bakeApiIntoBundle : 'vue-golden-layout',
			containedAPI : true,
			target: 'npm',	//'npm-browser' ??
			globalRequire: false
		})
	],
	package: {
		name: "vue-golden-layout",
		main: 'index.ts'
	},
	globals: {
		'vue-golden-layout': '*'
	}
});
fuse.bundle("vue-golden-layout").target('browser')
	.instructions('> [index.ts] +fuse-box-css +tslib');

fuse.run();
