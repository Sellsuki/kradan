#!/usr/bin/env node
'use strict'

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var chokidar = require('chokidar')
var helper = require('./helper.js')

var data = {}
data.ls = helper.getDirJson('.')
data.list = helper.getDirList('.')

app.use(express.static('./dist'))

app.use('/files', express.static('.', {
  dotfiles: 'allow',
  setHeaders: function (res, path, stat) {
    res.header('Content-Type', 'text/plain')
  }
}))

app.get('/ls', function (req, res) {
  let result = helper.getDirJson('.')
  res.send(result)
})

io.on('connection', function (socket) {
  io.emit('list', data.ls)
})

console.log(data.list)

chokidar.watch('.', {
  ignored: /[\/\\]\.|node_modules|\.git|\.DS_Store/,
  ignorePermissionErrors: true,
  persistent: true
}).on('all', (event, path) => {
  switch (event) {
    case 'unlink':
    case 'unlinkDir':
      data.ls = helper.getDirJson('.')
      io.emit('list', data.ls)
      break
    case 'add':
      if (!data.list.find(item => item === path)) {
        console.log('emit ' + path)
        data.ls = helper.getDirJson('.')
        io.emit('list', data.ls)
      }
      break
    case 'addDir':
      if (!data.list.find(item => item === path + '/') && path !== '.') {
        console.log('emit ' + path)
        data.ls = helper.getDirJson('.')
        io.emit('list', data.ls)
      }
      break
    case 'change':
      io.emit('change', path)
      break
    default:
      console.log(event + ' : ' + path)
  }
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})

// ----------------------------------------- //

if (process.platform === 'win32') {
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('SIGINT', function () {
    process.emit('SIGINT')
  })
}

process.on('SIGINT', function () {
  console.log('\nhttp-server stopped.')
  process.exit()
})

process.on('SIGTERM', function () {
  console.log('\nhttp-server stopped.')
  process.exit()
})
