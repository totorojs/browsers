'use strict';

var IEBrowser = function() {
  this.name = 'ie'

  this.getOptions = function(url) {
    return [url]
  }
}

