'use strict';

var utilx = require('utilx')

var ie  = {
  name: 'ie',

  getOptions: function() {
    return [this.capture]
  }
}

utilx.mix(ie, require('./base'))

module.exports = ie
