'use strict'

const XResource = require('../../xResource')
const xMethod = XResource.method
module.exports = XResource.extend({
	path: 'specs',
	includeBasic: [
		'create', 'list', 'retrieve', 'delete', 'update'
	],
	addAttr: xMethod({
        method: 'POST',
        path: '/addAttr'
	}),
})