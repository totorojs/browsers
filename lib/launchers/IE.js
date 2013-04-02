var BaseBrowser = require('./Base');
var _ = requier('underscore');

var IEBrowser = function(baseBrowserDecorator) {
    BaseBrowser.apply(this, arguments);
};

_.extend(IEBrowser.prototype, {
  name: 'IE',
  DEFAULT_CMD: {
    win32: process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe'
  },
  ENV_CMD: 'IE_BIN'
});

// PUBLISH
module.exports = IEBrowser;
