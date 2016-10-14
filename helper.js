'use strict'

var readDir = require('readdir')
var _ = require('lodash')

let isDir = function (path) {
  return path.match(/\/$/)
}

let getName = function (path) {
  return _.split(path, '/').filter((i) => i !== '').pop()
}

let splitPath = function (path) {
  return _.split(path, '/').filter((i) => i !== '')
}

let getDirList = function (path) {
  var list = readDir.readSync(path, null, readDir.INCLUDE_DIRECTORIES + readDir.INCLUDE_HIDDEN)
  return _.filter(list, (i) => !i.match(/[\/\\]\.|node_modules|\.git|\.DS_Store/))
}

let getDirJson = function (path) {
  var list = readDir.readSync(path, null, readDir.INCLUDE_DIRECTORIES + readDir.INCLUDE_HIDDEN)
  list = _.filter(list, (i) => !i.match(/[\/\\]\.|node_modules|\.git|\.DS_Store/))

  var result = []

  _.forEachRight(list, (item) => {
    var info = {
      path: item,
      name: getName(item)
    }
    if (isDir(item)) {
      info.type = 'directory'
      info.children = []
    } else {
      info.type = 'file'
    }

    var deep = splitPath(item)

    var temp = []
    temp[0] = result
    var i = 0
    for (; i < deep.length - 1; i++) {
      temp[i + 1] = temp[i].find(item => item.name === deep[i]).children
    }
    temp[i].splice(0, 0, info)
  })
  return _.sortBy(result, ['type'])
}

module.exports = { getDirJson, getDirList }
