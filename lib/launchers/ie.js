'use strict';

var IEBrowser = function() {
  this.name = 'ie'
  this.alias = 'iexplore'

  this.getOptions = function(url) {
    return [url]
  }
}

module.exports = IEBrowser
