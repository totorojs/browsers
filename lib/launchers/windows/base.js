'use strict';

var exec = require('child_process').exec;
var Base = require('./Base')
var util = require('util')

var helper = require('../helper')
var readLine = require ('readline')

// 处理 ctrl+c
(readLine.createInterface ({
  input: process.stdin,
  output: process.stdout
})).on ('SIGINT', function (){
  var params = ['/IM', (that.alias || that.name).toLowerCase() + '.exe', '/F']
  var p = spawn('taskkill', params)

  p.on('close', function() {
    process.emit('SIGINT')
  })
})

var Win32Base = function() {
  Base.apply(this, arguments)
}

util.inherits(Win32Base, Base)

Win32Base.prototype.getMemory = function(cb) {
  var bReg = new RegExp(this.name + '|' + this.alias, 'i')

  this.getBrowserProcessInfo('tasklist', [], bReg, function(infos) {
      infos.shift()

      var memory = infos.reduce(function(m, info) {
          info = info.split(/\s+/)
          return parseInt(info[info.length - 3].replace(/,/g, ''), 10) + m
      }, 0)

      cb(Math.round(memory/1024) + 'M')
  })
}

// 找到当前系统下的浏览器信息.
Win32Base.init = function(cb) {

}

