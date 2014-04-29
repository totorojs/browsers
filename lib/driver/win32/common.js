'use strict';

exports.regQueryPathPrefix =
  process.arch === 'x64' ?
  'HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\' :
  'HKEY_CURRENT_USER\\Software\\'

exports.archPath = process.arch === 'x64' ? 'Wow6432Node\\' : ''