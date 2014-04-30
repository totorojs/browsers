'use strict';

var logger = require('../logger')
var platform = process.platform

var browsers = ['chrome', 'firefox', 'safari', 'opera']
if (platform === 'win32') browsers.push('ie')


var driver = {
  get: function(name, cb) {
    if (this.browsers.indexOf(name) === -1) {
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
  browsers: browsers
}

module.exports = driver


