'use strict';

var fs = require('fs')
var path = require('path')
var util = require('util')

var BaseSafari = function() {
  this.name = 'safari'

  this._start = function(url) {
    var HTML_TPL = path.normalize(__dirname + '/../../static/safari.html')
    var that = this
    var id = this.id

    fs.readFile(HTML_TPL, function(err, data) {
      var content = data.toString().replace('%URL%', url)
      var staticHtmlPath = that.tempDir + id + '/redirect.html'
      // TODO mkdirp
      fs.writeFile(staticHtmlPath, content, function(err) {
        that.execCommand(that.getCommand(), [staticHtmlPath])
      })
    })
  }
}

// PUBLISH
module.exports = BaseSafari
