var { resolve } = require("path"),
	DtsBundle = require("dts-bundle"),
	{ copyFileSync, readdirSync, rmdirSync } = require("fs");

module.exports = DtsBundlePlugin;
function DtsBundlePlugin(options, fileEq) {
	Object.assign(this, {options, fileEq});
}
DtsBundlePlugin.prototype.apply = function(compiler) {
	var {options, fileEq} = this, baseDir = resolve(__dirname, options.baseDir||'');
	//compiler.plugin('done', function() {
	compiler.hooks.afterEmit.tap('dts-bundle', function() {
		if(fileEq) for(let dst in fileEq) {
			let src = fileEq[dst];
			dst = resolve(baseDir, dst);
			src = resolve(baseDir, src);
			copyFileSync(src, dst);
		}
		DtsBundle.bundle(options);
		// RemoveSource does not remove empty directories
		if(options.removeSource) {
			var gen = readdirSync(baseDir, {withFileTypes: true});
			gen.filter(dirent=> dirent.isDirectory())
			//ignore error if directory not empty - that's the point
				.map(dirent=> rmdirSync(resolve(baseDir, dirent.name)));
		}
	});
};