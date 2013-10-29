'use strict';

var util = require('util')
var Base = require('../')

var DarwinBase = function() {
  Base.apply(this, arguments)
}

DarwinBase.browsers = ['chrome', 'firefox', 'safari', 'opera']

util.inherits(DarwinBase, Base)

module.exports = DarwinBase
