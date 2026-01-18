module.exports = {
	hooks: {
		beforePacking(pkg) {
			delete pkg.devDependencies;
			delete pkg.scripts;

			pkg.publishedAt = new Date().toISOString();

			return pkg;
		},
	},
};
