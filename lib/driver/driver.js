'use strict';

var chrome = require('./darwin/chrome')
chrome.isExist(function(result) {
  if (!result) return
  chrome.open('http://www.baidu.com')

  setTimeout(function() {
    chrome.close()
  }, 5000)
})


function Driver() {

}

Driver.browsers = ['chrome', 'firefox', 'safari', 'opera']
if (process.platform === 'win32') Driver.browsers.push('ie')

