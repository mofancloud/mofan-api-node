'use strict'

const XResource = require('../../xResource')
const xMethod = XResource.method
module.exports = XResource.extend({
	path: 'skus',
	includeBasic: [
		'create', 'list', 'retrieve', 'delete', 'update'
	]
})