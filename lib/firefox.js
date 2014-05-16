'use strict';

var fs = require('fs')
var path = require('path')
var shelljs = require('shelljs')
var spawn = require('child_process').spawn
var utilx = require('utilx')

var PREFS =
  'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
  'user_pref("dom.disable_open_during_load", false);\n' +
  'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n' +
  'user_pref("network.proxy.type", 0);\n'

var firefox = {
  name: 'firefox',

  // https://developer.mozilla.org/en-US/docs/Command_Line_Options
  getOptions: function(capture) {
    return [capture, '-profile', this.tempDir + this.name, '-no-remote', '-slient']
  },

  createProfile: function(cb) {
    var that = this
    var profileDir = this.tempDir + this.name
    if (fs.existsSync(profileDir)) {
      shelljs.rm('-rf', profileDir)
    }

    var proc = spawn(this.getCommand(), ['-CreateProfile', 'totorojs-' + this.name + ' ' + profileDir])

    var errorOutput = ''
    proc.stderr.on('data', function(data) {
      errorOutput += data.toString()
    })

    proc.on('close', function() {
      var match = /at\s\'(.*)[\/\\]prefs\.js\'/.exec(errorOutput)

      if (match) {
        profileDir = match[1]
      }
      var profilePath = profileDir + path.sep + 'prefs.js'

      setTimeout(function() {
        if (utilx.isExistedFile(profilePath)) {
          fs.writeFileSync(profilePath, PREFS)
        }
        cb && cb()
      }, 1000)
    })
  }
}

utilx.mix(firefox, require('./base'))

module.exports = firefox




