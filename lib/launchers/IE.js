'use strict';

var util = require('util');
var BaseBrowser = require('./Base');
var _ = require('underscore');

var IEBrowser = function(baseBrowserDecorator) {
    BaseBrowser.apply(this, arguments);
};

util.inherits(IEBrowser, BaseBrowser);

_.extend(IEBrowser.prototype, {
  name: 'IE',
  DEFAULT_CMD: {
    win32: process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe'
  },
  ENV_CMD: 'IE_BIN'
});

// PUBLISH
module.exports = IEBrowser;
