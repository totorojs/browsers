'use strict';

var BaseBrowser = require('./Base')
var util = require('util')

var helper = require('../helper')

var ChromeBrowser = function() {
  BaseBrowser.apply(this, arguments)

  this._getOptions = function(url) {
    // Chrome CLI options
    // http://peter.sh/experiments/chromium-command-line-switches/
    return [
      '--user-data-dir=' + this._tempDir + this.name,
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-default-apps',
      '--start-maximized',
      '--disable-restore-session-state',
      '--disable-sync',
      '--disable-popup-blocking',
      '--noerrdialogs ',
      url
    ]
  }
}


util.inherits(Chrome, Base)

Chrome.getVersion = function() {
  exec(this.qryVersion, function (err, stdout) {
    var data = stdout.split('\r\n')
    var version = ''
    var inChrome;

    data.forEach(function(line) {
      if (inChrome && !version) {
        if (/pv/.test(line)) {
         version = line.replace('pv', '').replace('REG_SZ', '').trim();
        }
      }
      if (/Google Chrome/.test(line)) {
        inChrome = true;
      }
    })

    callback(null, version);
  })
}


helper.extend(ChromeBrowser.prototype, {
  name: 'Chrome',

  DEFAULT_CMD: {
    linux: 'google-chrome',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: process.env.ProgramFiles + '\\Google\\Chrome\\Application\\chrome.exe'
  },
  ENV_CMD: 'CHROME_BIN'
})

// PUBLISH
module.exports = ChromeBrowser
