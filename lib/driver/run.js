'use strict';

var driver = require('./driver')

driver.get('chrome', function(browser) {
  browser.open('http://totorojs.github.io/browsers/')
})
