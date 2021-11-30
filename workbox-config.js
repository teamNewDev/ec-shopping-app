module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{png,js,css,html,json}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'sw.js'
};