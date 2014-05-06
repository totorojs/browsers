'use strict';

var driver = require('./')

driver.availableDrivers.forEach(function(name) {
  driver.get(name, function(browser) {
    browser.open('http://totorojs.github.io/browsers/')
    browser.open('http://www.google.com')

    setTimeout(function() {
      browser.close()
      setTimeout(function() {
        browser.open('http://www.baidu.com')
      }, 5000)
    }, 5000)
  })
})

