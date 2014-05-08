'use strict';

var fs = require('fs')
var path = require('path')
var shelljs = require('shelljs')
var utilx = require('utilx')

var safari = {
  name: 'safari',

  getOptions: function() {
    return [this.tempDir + this.name + '/redirect.html']
  },

  createProfile: function(cb, capture) {
    var HTML_TPL = path.normalize(__dirname + '/../static/safari.html')
    var that = this

    fs.readFile(HTML_TPL, function(err, data) {
      var content = data.toString().replace('%URL%', that.capture)
      var staticHtmlPath = that.tempDir + that.name + '/redirect.html'

      if (!fs.existsSync(path.dirname(staticHtmlPath))) {
        shelljs.mkdir(path.dirname(staticHtmlPath))
      }

      fs.writeFile(staticHtmlPath, content, function(err) {
        cb()
      })
    })
  }
}

utilx.mix(safari, require('./base'))

module.exports = safari
