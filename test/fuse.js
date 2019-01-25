const path = require("path"),
	{FuseBox, CSSPlugin, VueComponentPlugin, HTMLPlugin} = require("fuse-box");
const fuse = FuseBox.init({
	homeDir: "..",
	output: "test/dist/$name.js",
	cache: true,
	debug: true,
	sourceMaps: true,
	plugins: [
		CSSPlugin(),
		VueComponentPlugin(),
		HTMLPlugin()
	],
	package: {
		name: "app",
		main: 'test/index.ts'
	},
	globals: {
		'app': '*'
	},
	alias: {
		vue: 'vue/dist/vue.esm.js', //route are only given a template and need to be compiled client-side
		'vue-golden-layout': '../src/index.ts'
	}
});
fuse.bundle("app").target('browser')
	.instructions('> test/index.ts +fuse-box-css')
	.watch('..', path=> /(?!dist\/)/.test(path));
fuse.dev({
	port: 9000,
	root: "dist",
	fallback: "index.html",
});
fuse.run();
