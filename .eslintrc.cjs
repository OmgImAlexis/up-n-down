module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		'xo',
	],
	parserOptions: {
		ecmaVersion: 13,
		sourceType: 'module',
	},
	rules: {
		'object-curly-spacing': ['error', 'always'],
		camelcase: 'off',
		'max-depth': 'off',
		'max-params': 'off',
	},
};
