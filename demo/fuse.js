const path = require("path"),
	{FuseBox, CSSPlugin, VueComponentPlugin, HTMLPlugin} = require("fuse-box");
const fuse = FuseBox.init({
  	allowSyntheticDefaultImports: true,
	homeDir: "..",
	output: "dist/$name.js",
	tsConfig: "./tsconfig.json",
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
		main: "demo/index.ts"
	},
	globals: {
		"app": "*"
	},
  	shim: {
		jquery: {
			source: "../node_modules/jquery/dist/jquery.js",
			exports: "$"
		}
  	},
	alias: {
		vue: "vue/dist/vue.esm.js", //routes are only given a template and need to be compiled client-side
		"vue-golden-layout": "../src"
	}
});
fuse.bundle("app").target("browser")
	.instructions("> demo/index.ts +fuse-box-css")
	.hmr()
	.watch(/*".", path=> {
		return /^(src|demo\/(?!dist\/))\//.test(path);
	}*/);
fuse.dev({
	port: 9000,
	root: "dist",
	fallback: "index.html",
});
fuse.run({
	chokidarPaths: ["src", "demo", "node_modules"],
	chokidar: {
		ignored: /dist\//
	}
});
