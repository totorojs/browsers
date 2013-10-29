'use strict';

var fs = require('fs')
var path = require('path')
var util = require('util')
var shelljs = require('shelljs')

var BaseSafari = function() {
  this.name = 'safari'

  this.createProfile = function(cb) {
    var HTML_TPL = path.normalize(__dirname + '/../../static/safari.html')
    var that = this
    var id = this.id

    fs.readFile(HTML_TPL, function(err, data) {
      var content = data.toString().replace('%URL%', that.capture)
      var staticHtmlPath = that.tempDir + that.name + '/redirect.html'

      if (!fs.existsSync(path.dirname(staticHtmlPath))) {
        shelljs.mkdir(path.dirname(staticHtmlPath))
      }

      // TODO mkdirp
      fs.writeFile(staticHtmlPath, content, function(err) {
        cb.call(that, staticHtmlPath)
      })
    })
  }

  this.getOptions = function(staticHtmlPath) {
    return [staticHtmlPath]
  }
}

// PUBLISH
module.exports = BaseSafari
