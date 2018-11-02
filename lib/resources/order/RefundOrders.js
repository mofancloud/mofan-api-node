'use strict'

const XResource = require('../../xResource')
const xMethod = XResource.method
module.exports = XResource.extend({
	path: 'refund_orders',
	includeBasic: [
		'create', 'retrieve', 'list'
	]
})