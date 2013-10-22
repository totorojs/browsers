'use strict';

var BaseChrome = function() {
  this.name = 'chrome'

  this.getOptions = function(url) {
    // Chrome CLI options
    // http://peter.sh/experiments/chromium-command-line-switches/
    return [
      '--user-data-dir=' + this.tempDir + this.name,
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

// PUBLISH
module.exports = BaseChrome
