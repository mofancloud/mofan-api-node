'use strict'

const XResource = require('../../xResource')
const xMethod = XResource.method
module.exports = XResource.extend({
    query: xMethod({
        method: 'POST',
        path: '/express/query'
    })
})
