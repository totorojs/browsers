'use strict';

var IEBrowser = function() {
  this.name = 'ie'
  this.alias = 'iexplore'

  this.getOptions = function() {
    return [this.capture]
  }
}

module.exports = IEBrowser
