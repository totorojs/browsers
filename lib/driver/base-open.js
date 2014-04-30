'use strict';

var spawn = require('child_process').spawn
var logger = require('../logger')

process.on('message', function(msg) {
  if (msg.action === 'open') {
    var proc = spawn(msg.cmd, msg.opts)
    logger.debug(msg.name, 'open (pid:', proc.pid, ')')
  }
})