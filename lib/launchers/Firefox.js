'use strict';

var fs = require('fs')
var util = require('util')
var spawn = require('child_process').spawn
var _ = require('underscore')
var rimraf = require('rimraf')

var BaseBrowser = require('./Base')
var log = require('../logger')

var PREFS =
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n'


// https://developer.mozilla.org/en-US/docs/Command_Line_Options
var FirefoxBrowser = function() {
    BaseBrowser.apply(this, arguments)
    var self = this

    this._start = function(id, url) {
        var command = this._getCommand()
        var errorOutput = ''
        var tempDir = self._tempDir + id

        var p = spawn(command, ['-CreateProfile', 'totorojs-' + id + ' ' + tempDir, '-no-remote'])

        p.stderr.on('data', function(data) {
            errorOutput += data.toString()
        })

        p.on('close', function() {
            var match = /at\s\'(.*)[\/\\]prefs\.js\'/.exec(errorOutput)

            if (match) {
                self._errTempDir = match[1]
            }

            fs.createWriteStream(self._errTempDir + '/prefs.js', {flags: 'a'}).write(PREFS)
            self._execCommand(id, command, [url, '-profile', self._errTempDir, '-no-remote'])
        })
    }

    process.on('exit', function() {
        console.log('Cleaning err temp dir %s', self._errTempDir)
        rimraf(self._errTempDir, function(e) {console.info('rm------->', e)})
    })
}

util.inherits(FirefoxBrowser, BaseBrowser)

_.extend(FirefoxBrowser.prototype, {
    name: 'Firefox',

    DEFAULT_CMD: {
        linux: 'firefox',
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
        win32: process.env.ProgramFiles + '\\Mozilla Firefox\\firefox.exe'
    },
    ENV_CMD: 'FIREFOX_BIN'
})

// PUBLISH
module.exports = FirefoxBrowser
