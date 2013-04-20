'use strict';

var http = require('http')
var url = require('url')

exports.run = function(options, callback) {
	var browsersInfo = 'browsers=' + JSON.stringify(options.browsers)

	var urlInfo = url.parse(options.hub)

	var reqOptions = {
		hostname:  urlInfo.hostname,
		port: urlInfo.port,
		path: urlInfo.path,
		method: 'POST',
		headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': browsersInfo.length
        }
	}

	var req = http.request(reqOptions, function(res) {
		console.log('STATUS: ' + res.statusCode);
		res.on('data', function(chunk) {

		})

		res.on('end', function() {
			callback()
		})
	})

	req.on('error', function(e) {
		console.error('register ' + options.hub + ' error!')
		console.error(e)
	})
	req.write(browsersInfo)
	req.end()
}
