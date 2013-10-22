'use strict';

var BaseChrome = function() {
  this.name = 'chrome'

  this.getOptions = function(url) {
    // Chrome CLI options
    // http://peter.sh/experiments/chromium-command-line-switches/
    return [
      url,
      '--user-data-dir=' + this.tempDir + this.name,
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-default-apps',
      '--start-maximized',
      '--disable-restore-session-state',
      '--disable-sync',
      '--disable-translate',
      '--disable-web-resources',
      '--safebrowsing-disable-auto-update',
      '--safebrowsing-disable-download-protection',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--use-mock-keychain',
      '--ignore-certificate-errors',
      '--disable-popup-blocking',
      '--noerrdialogs',
    ]
  }
}

// PUBLISH
module.exports = BaseChrome


