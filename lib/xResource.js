'use strict'

var http = require('http')
var https = require('https')
var path = require('path')
var when = require('when')
const sha256 = require('sha256')
var _ = require('lodash')

var utils = require('./utils')
var Error = require('./Error')
var hasOwn = {}.hasOwnProperty

// Provide extension mechanism for Pingpp Resource Sub-Classes
XResource.extend = utils.protoExtend

// Expose method-creator & prepared (basic) methods
XResource.method = require('./xMethod')
XResource.BASIC_METHODS = require('./xMethod.basic.js')

/**
 * Encapsulates request logic for a X Resource
 */

function XResource(x, urlData) {
	this._x = x
	this._urlData = urlData || {}

	this.basePath = utils.makeURLInterpolator(x.getApiField('basePath'))
	this.path = utils.makeURLInterpolator(this.path)
	if (this.includeBasic) {
		this.includeBasic.forEach(function(methodName) {
			this[methodName] = XResource.BASIC_METHODS[methodName]
		}, this)
	}

	this.initialize.apply(this, arguments)
}

XResource.prototype = {
	path: '',
	initialize: function() {},
	createFullPath: function(commandPath, urlData) {
		return path.join(
			this.basePath(urlData),
			this.path(urlData),
			typeof commandPath === 'function'
				? commandPath(urlData) : commandPath
		).replace(/\\/g, '/') // ugly workaround for Windows
	},

	createUrlData: function() {
		var urlData = {}
		for (var i in this._urlData) {
			if (hasOwn.call(this._urlData, i)) {
				urlData[i] = this._urlData[i]
			}
		}

		return urlData
	},

	createDeferred: function(callback) {
		var deferred = when.defer()

		if (callback) {
			// Callback, if provided, is a simply translated to Promise'esque:
			// (Ensure callback is called outside of promise stack)
			deferred.promise.then(function(res) {
				setTimeout(function() { callback(null, res) }, 0)
			}, function(err) {
				setTimeout(function() { callback(err, null) }, 0)
			})
		}

		return deferred
	},

	_timeoutHandler: function(timeout, req, callback) {
		var self = this
		return function() {
			var timeoutErr = new Error('ETIMEOUT')
			timeoutErr.code = 'ETIMEOUT'

			req._isAborted = true
			req.abort()

			callback.call(
				self,
				new Error.XConnectionError({
					message: 'Request aborted due to timeout being reached (' + timeout + 'ms)',
					detail: timeoutErr
				}),
				null
			)
		}
	},

	_responseHandler: function(req, callback) {
		var self = this
		return function(res) {
			var response = ''

			res.setEncoding('utf8')
			res.on('data', function(chunk) {
				response += chunk
			})
			res.on('end', function() {
				if (response.length !== 0) {
					try {
						response = JSON.parse(response)
						const errMsg = response.error || response.detail
						if (errMsg) {
							var err
							if (res.statusCode === 401) {
								err = new Error.XAuthenticationError(errMsg)
							} else {
								err = Error.XError.generate(errMsg)
							}
							return callback.call(self, err, null)
						}
					} catch (e) {
						return callback.call(
							self,
							new Error.XAPIError({
								message: `Invalid JSON received from the GLOBAL API PATH:${req.path}`,
								response: response,
								exception: e
							}),
							null
						)
					}
				}
				callback.call(self, null, response)
			})
		}
	},

	_errorHandler: function(req, callback) {
		var self = this
		return function(error) {
			if (req._isAborted) return // already handled
			callback.call(
				self,
				new Error.XConnectionError({
					message: 'An error occurred with our connection to X',
					detail: error.message
				}),
				null
			)
		}
	},

	_appendParams: function(method, path, data) {


        const timestamp = new Date().getTime();

		const config = {
            timestamp:  timestamp,
		}
        const signStr = utils.generateSign(data)
		data.timestamp = timestamp
		data.uri = path
	},

	_request: function(method, path, data, auth, callback) {
		var requestData = ''
		var contentType = 'application/json'
		// this._signRequest(method,path,data)
		switch (method) {
			case 'POST':
			case 'PUT':
				requestData = JSON.stringify(data || {})
				break
			case 'GET':
			case 'DELETE':
				contentType = 'application/x-www-form-urlencoded'
				path = data ? (path + '?' + utils.stringifyRequestData(data)) : path
				break
			default:
		}
		var self = this

		var apiVersion = this._x.getApiField('version')
		var headers = {
            'Authorization': auth ?
                'Basic ' + new Buffer(auth + ':').toString('base64') :
                this._x.getApiField('auth'),
			'Accept': 'application/json',
			'Content-Type': contentType + '; charset=UTF-8',
			'User-Agent': 'X NodeBindings/' + this._x.getConstant('PACKAGE_VERSION')
		}



		var requestTime = Date.parse(new Date()) / 1000

        if (this._x.getPrivateKey()) {
			console.log("requestdata")
			console.log(requestData)
            console.log("path")
            console.log(path)
            headers['X-Request-Signature'] = utils.generateSign(
                requestData + path + requestTime,
                this._x.getPrivateKey()
            );
        }

		headers['X-Request-Timestamp'] = requestTime
        console.log("Timestamp")
        console.log(requestTime)
		if (apiVersion) {

            headers['X-Version'] = apiVersion
        }
		headers = _.assign(headers, this._x.getParsedHeaders())

		this._x.getClientUserAgent(function(cua) {

            headers['X-Client-User-Agent'] = cua
            makeRequest()
        })
		function makeRequest() {

            var timeout = self._x.getApiField('timeout')
            let protocol = self._x.getApiField('protocol');
            var isInsecureConnection = protocol == 'http'? http : https
			const host = self._x.getApiField('host');
            headers['Host'] = host
            const port = self._x.getApiField('port');
            var req = (
				isInsecureConnection
			).request({
				host: host,
				port: port,
				path: path,
				method: method,
				headers: headers
			})

			req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback))
			req.on('response', self._responseHandler(req, callback))
			req.on('error', self._errorHandler(req, callback))
			console.log(requestData)
			req.on('socket', function(socket) {
				socket.on(isInsecureConnection ? 'connect' : 'secureConnect', function() {
					req.write(requestData)
					req.end()
				})
			})
		}
	}
}

module.exports = XResource
