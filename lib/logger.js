'use strict';

var colorful = require('colorful')

var methods = ['debug', 'info', 'warn', 'error']
var level = 'info'
process.argv.forEach(function(item, idx, list) {
  if (item.match(/^(--debug|-[a-zA-Z]*d[a-zA-Z]*)$/)) {
    level = 'debug'
  }
})

module.exports = require('tracer').colorConsole({
  depth: 5,
  methods: methods,
  level: level,

  format: "{{title}}: {{message}} ({{file}}: {{line}})",

  filters: {
    info: colorful.gray,
    warn: colorful.yellow,
    error: colorful.red
  },

  transport: function(data) {
    var title = data.title;
    if (methods.indexOf(title) >= methods.indexOf(level)) {
      if (title === 'error') {
        throw new Error(data.message)
      } else {
        console.log(data.output)
      }
    }
  }
})