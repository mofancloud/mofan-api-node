'use strict'

const XResource = require('../../xResource')
const xMethod = XResource.method
module.exports = XResource.extend({
	path: 'orders',
	includeBasic: [
		'create', 'list', 'retrieve'
	],
	deliver: xMethod({
        method: 'POST',
        path: '/order/deliver'
	}),
	cancel: xMethod({
        method: 'POST',
        path: '/order/cancel'
	}),
	signed: xMethod({
        method: 'POST',
        path: '/order/signed'
	}),
	modifyExpress: xMethod({
        method: 'POST',
        path: '/order/express/modify'
	}),
	modifyNote: xMethod({
	    method: 'POST',
        path: '/order/note/modify'	
	})
})
