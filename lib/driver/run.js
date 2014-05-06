'use strict';

var driver = require('./')

driver.availableDrivers.forEach(function(name) {
  driver.get(name, function(browser) {
    browser.open('http://totorojs.github.io/browsers/')
    //browser.open('http://www.google.com')

    setTimeout(function() {
      browser.reopen('http://www.baidu.com')
    }, 20000)
  })
})

