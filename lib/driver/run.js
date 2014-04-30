'use strict';

var driver = require('./driver')

driver.get('chrome', function(browser) {
  browser.open('http://totorojs.github.io/browsers/')
  browser.open('haha')
  setTimeout(function() {
    browser.close()

    setTimeout(function() {
      browser.open('http://www.baidu.com')
    }, 5000)
  }, 5000)
})
