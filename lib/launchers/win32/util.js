'use strict';

exports.getRegBasePath = function() {
  if (process.arch === 'x64') {
    return 'HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\'
  } else {
    return 'HKEY_CURRENT_USER\\Software\\'
  }
}

exports.archPath = (process.arch === 'x64' ? 'Wow6432Node\\' : '')

