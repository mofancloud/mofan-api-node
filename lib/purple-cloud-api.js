'use strict'

XAPI.DEFAULT_HOST = 'api.qiaoqiaowan.net'
XAPI.DEFAULT_PORT = 8442
XAPI.DEFAULT_BASE_PATH = '/'
XAPI.DEFAULT_API_VERSION = null

XAPI.DEFAULT_TIMEOUT = require('http').createServer().timeout

XAPI.PACKAGE_VERSION = require('../package.json').version

XAPI.USER_AGENT = {
	bindings_version: XAPI.PACKAGE_VERSION,
	lang: 'node',
	lang_version: process.version,
	platform: process.platform,
	publisher: 'xapi',
	uname: null
}

XAPI.USER_AGENT_SERIALIZED = null

var exec = require('child_process').exec
var _ = require('lodash')

var resources = {
    express: require('./resources/Express'),
}

var _ = require('lodash')
var fs = require('fs')

function XAPI(key, version) {
	if (!(this instanceof XAPI)) {
		return new XAPI(key, version);
	}

	this._api = {
		auth: null,
		protocol: 'https',
		host: XAPI.DEFAULT_HOST,
		port: XAPI.DEFAULT_PORT,
		basePath: XAPI.DEFAULT_BASE_PATH,
		version: XAPI.DEFAULT_API_VERSION,
		timeout: XAPI.DEFAULT_TIMEOUT,
		dev: false
	}

	this._parsedHeaders = {}
	this._privateKey = null

	this._prepResources()
	this._prepExtraFuncs()

    this.setApiKey(key);
    this.setApiVersion(version);
}

XAPI.prototype = {
	setHost: function(host, port, protocol) {
		this._setApiField('host', host)
		if (port) this.setPort(port)
		if (protocol) this.setProtocol(protocol)
	},
	setProtocol: function(protocol) {
		this._setApiField('protocol', protocol.toLowerCase())
	},
	setAppId: function(appid) {
		this._setApiField('appid', appid)
	},
	setPort: function(port) {
		this._setApiField('port', port)
	},
	setAppsecret: function(key) {
	        this._setApiField('appsecret', key)
	},

	setApiVersion: function(version) {
		if (version) {
			this._setApiField('version', version)
		}
	},
	setApiKey: function(key) {
		if (key) {
			this._setApiField(
				'auth',
				'Basic ' + new Buffer(key + ':').toString('base64')
			)
		}
	},
	setTimeout: function(timeout) {
		this._setApiField(
			'timeout',
			timeout == null ? XAPI.DEFAULT_TIMEOUT : timeout
		)
	},
	_setApiField: function(key, value) {
		this._api[key] = value
	},
	getApiField: function(key) {
		return this._api[key]
	},
	getConstant: function(c) {
		return XAPI[c]
	},
	getClientUserAgent: function(cb) {
		if (XAPI.USER_AGENT_SERIALIZED) {
			return cb(XAPI.USER_AGENT_SERIALIZED)
		}

		exec('uname -a', function(err, uname) {
			XAPI.USER_AGENT.uname = uname || 'UNKNOWN'
			XAPI.USER_AGENT_SERIALIZED = JSON.stringify(XAPI.USER_AGENT)
			cb(XAPI.USER_AGENT_SERIALIZED)
		})
	},
	setPrivateKey: function(privateKey) {
		this._privateKey = privateKey
	},

	getPrivateKey: function() {
		return this._privateKey
	},

	setPrivateKeyPath: function(path) {
		this._privateKey = fs.readFileSync(path, 'utf8')
	},

	_prepResources: function() {
		for (var name in resources) {
			this[
				name[0].toLowerCase() + name.substring(1)
			] = new resources[name](this)
		}
	},

	_setParsedHeader: function(key, value) {
		this._parsedHeaders[key] = value
	},

	getParsedHeaders: function() {
		return this._parsedHeaders
	},

	_prepExtraFuncs: function() {
		var self = this
		this['parseHeaders'] = function(headers) {
			if (typeof headers === 'undefined') {
				return
			}
			for (var k in headers) {
				var key = _.startCase(k.toLowerCase()).replace(/\s/g, '-')
				if (_.indexOf(HEADERS_TO_PARSE, key) != -1) {
					self._setParsedHeader(key, headers[k])
				}
			}
		}
	}
}

module.exports = XAPI
