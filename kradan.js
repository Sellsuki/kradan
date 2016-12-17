#!/usr/bin/env node
'use strict'

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var chokidar = require('chokidar')
var helper = require('./helper.js')
var path = require('path')
var os = require('os')
var colors = require('colors/safe')

var ifaces = os.networkInterfaces()
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
})
var data = {}
data.ls = helper.getDirJson('.')
data.list = helper.getDirList('.')

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
})

app.use('/files', express.static('.', {
  dotfiles: 'allow',
  setHeaders: function (res, path, stat) {
    res.header('Content-Type', 'text/plain')
  }
}))

var staticPath = path.join(__dirname, './dist')
app.use('/', express.static(staticPath))

app.get('/ls', function (req, res) {
  let result = helper.getDirJson('.')
  res.send(result)
})

io.on('connection', function (socket) {
  io.emit('list', data.ls)
})

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
        data.ls = helper.getDirJson('.')
        io.emit('list', data.ls)
      }
      break
    case 'addDir':
      if (!data.list.find(item => item === path + '/') && path !== '.') {
        data.ls = helper.getDirJson('.')
        io.emit('list', data.ls)
      }
      break
    case 'change':
      io.emit('change', '/' + path)
      break
    default:
      console.log(event + ' : ' + path)
  }
})

http.listen(1112, function () {
  console.log(colors.warn('Starting up kradan'))
  console.log(colors.warn('Available on:'))
  Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4') {
        console.log(colors.info('  http://' + details.address + ':1112'))
      }
    })
  })
  console.log('Hit CTRL-C to stop the server')
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
