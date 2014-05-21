'use strict';

var logger = require('./logger')
var platform = process.platform

if (platform !== 'win32' && platform !== 'darwin')
  logger.error('Platform', platform, 'is not supported now.')

var availableBrowsers = ['chrome', 'firefox', 'safari']
if (platform === 'win32') availableBrowsers.push('ie')


var driver = {
  availableBrowsers: availableBrowsers,

  get: function(name, cb) {
    var that = this

    if (availableBrowsers.indexOf(name) === -1) {
      logger.warn('Not found driver for', name)
      cb()
      return
    }

    var browser = require('./' + platform + '/' + name)
    browser.isExist(function(result) {
      if (result) {
        cb(browser)
      } else {
        logger.warn('Not found browser', name,
          '. It may not installed or not installed at default path.')
        cb()
      }
    })
  }
}

module.exports = driver



