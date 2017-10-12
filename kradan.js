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
var minimist = require('minimist')
var version = require('./package.json').version
var argv = minimist(process.argv.slice(2))
var port = argv.port || argv.p || 1112

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

if (argv.h || argv.help) {
  console.log(`
    Online code viewer with realtime updates.

    Usage:
      $ kradan

    Options:
      -h, --help    Display help messages
      -p, --port    Specify port number

    Examples:
      ${colors.data('# Display help messages')}
      $ kradan --help
      ${colors.data('# Start server on port 8080')}
      $ kradan -p 8080
      ${colors.data('# Start server on port 8080')}
      $ kradan --port=8080
  `)
  return
}

if (argv.v || argv.version) {
  console.log(version)
  return
}

/* port validation */
if (!Number.isInteger(port) || !(port > 1023 && port < 65535)) {
  console.log(colors.error('Please specify a valid port number.'))
  return
}

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

http.listen(port, function () {
  console.log(colors.warn('Starting up kradan'))
  console.log(colors.warn('Available on:'))
  Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4') {
        console.log(colors.info('  http://' + details.address + `:${port}`))
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
