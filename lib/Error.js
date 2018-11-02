'use strict'

var utils = require('./utils')

module.exports = _Error

/**
 * Generic Error klass to wrap any errors returned by XService-node
 */
function _Error(_raw) {
	this.populate.apply(this, arguments)
	this.stack = (new Error(this.message)).stack
}

// Extend Native Error
_Error.prototype = Object.create(Error.prototype)

_Error.prototype.type = 'GenericError'
_Error.prototype.populate = function(type, message) {
	this.type = type
	this.message = message
}

_Error.extend = utils.protoExtend

/**
 * Create subclass of internal Error klass
 * (Specifically for errors returned from XService's REST API)
 */
var XError = _Error.XServiceError = _Error.extend({
	type: 'XError',
	populate: function(raw) {
		// Move from prototype def (so it appears in stringified obj)
		this.type = this.type

		this.stack = (new Error(raw.message)).stack
		this.rawType = raw.type
		this.code = raw.code
		this.param = raw.param
		this.message = raw.message
		this.detail = raw.detail
		this.raw = raw
	}
})

/**
 * Helper factory which takes raw XService errors and outputs wrapping instances
 */
XError.generate = function(rawXError) {
	switch (rawXError.type) {
		case 'invalid_request_error':
			return new _Error.XInvalidRequestError(rawXError)
		case 'api_error':
			return new _Error.XAPIError(rawXError)
		case 'channel_error':
			return new _Error.XChannelError(rawXError)
	}

	return new _Error('Generic', 'Unknown Error')
}

// Specific XService Error types:
_Error.XInvalidRequestError = XError.extend({ type: 'XInvalidRequest' })
_Error.XAPIError = XError.extend({ type: 'XAPIError' })
_Error.XConnectionError = XError.extend({ type: 'XConnectionError' })
_Error.XChannelError = XError.extend({ type: 'XChannelError' })
_Error.XAuthenticationError = XError.extend({ type: 'XAuthenticationError' })
