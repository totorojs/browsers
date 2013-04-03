'use strict';

var util = require('util');
var BaseBrowser = require('./Base');
var ScriptBrowser = function(script) {
    BaseBrowser.apply(this, arguments);

    this.name = 'Script';

    this._getCommand = function () {
        return script;
    };
    this.on =function(){};
    this.emit = function(){};
};


util.inherits(ScriptBrowser, BaseBrowser);

// PUBLISH
module.exports = ScriptBrowser;
