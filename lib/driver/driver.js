'use strict';

var chrome = require('./darwin/chrome')
chrome.isExistent(function(result) {
  if (!result) return
  chrome.init({
    capture: 'http://www.baidu.com'
  })
  chrome.start()
})


function Driver() {

}

Driver.browsers = ['chrome', 'firefox', 'safari', 'opera']
if (process.platform === 'win32') Driver.browsers.push('ie')

