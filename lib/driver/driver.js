'use strict';

var logger = require('../logger')
var platform = process.platform

if (platform !== 'win32' && platform !== 'darwin')
  logger.error('Sorry,', platform, 'is not supported.')

var availableDrivers = ['chrome', 'firefox', 'safari', 'opera']
if (platform === 'win32') availableDrivers.push('ie')


var driver = {
  get: function(name, cb) {
    if (availableDrivers.indexOf(name) === -1) {
      logger.warn('Not found driver for', name)
      return
    }

    var browser = require('./' + platform + '/' + name)
    browser.isExist(function(result) {
      if (!result) {
        logger.warn('Not found browser', name,
          '. It may not installed or not installed at default path.')
        return
      }

      cb(browser)
    })

  },
  availableDrivers: availableDrivers
}

module.exports = driver


