<template lang="html">
  <div class="app">
    <div class="left">
      <div class="tree">
        <ul>
          qweqweqweqqwqwe
          <item
            class="item"
            :model="list"
            :currentOpenFilePath="currentOpenFilePath"
            :unseen-file-paths="unseenFilePaths"
            :unseen-folder-paths="unseenFolderPaths"
            @openFile="openFile">
          </item>
        </ul>
      </div>
      <div download  class="download-button" @click="downloadZip">
        {{list.name}}.zip
      </div>
    </div>
    <div class="right">
      <ul class="tabs">
        <li class="tabs-tab" v-for="file in openFiles" :class="{'is-active': currentOpenFilePath === file.path}" @click.self="openFile(file.path)">
          <span class="tabs-tab-name" @click.self="openFile(file.path)">{{file.name}}</span>
          <span class="icon" @click="closeFile(file.path)" style="float: right;">
            <i class="fa fa-close" aria-hidden="true" v-show="!isUnseenTab(file.path)"></i>
            <i class="fa fa-pencil" aria-hidden="true" v-show="isUnseenTab(file.path)"></i>
          </span>
        </li>
      </ul>
      <div class="item-views">
        <div v-for="openFile in openFiles">
          <viewer v-if="currentOpenFilePath === openFile.path" :info="openFile" :unseen-line="unseenLine"></viewer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global io */
import Item from 'components/Item'
import Viewer from 'components/Viewer'

var JsDiff = require('diff')
var JSZip = require('jszip')
var FileSaver = require('file-saver')
var zip = new JSZip()

function makeMarker () {
  var marker = document.createElement('div')
  marker.style.color = '#fba949'
  marker.innerHTML = '|'
  return marker
}
export default {
  data () {
    return {
      list: {
        name: 'Root',
        path: '/',
        children: []
      },
      currentOpenFilePath: '',
      openFiles: [],
      unseenFilePaths: [],
      unseenFolderPaths: [],
      unseenLine: []
    }
  },
  computed: {
  },
  mounted () {
    let vm = this
    var socket = io.connect()
    socket.on('list', function (list) {
      vm.list = list
    })
    socket.on('change', function (path) {
      console.log('change ' + path)
      vm.addUnseenFile(path)
      let fileChanged = vm.openFiles.find(file => file.path === path)
      if (fileChanged) {
        vm.getFile(path)
      }
    })
  },
  methods: {
    getFile (path) {
      let vm = this
      vm.$http.get('/files' + path).then((response) => {
        let name = path.split('/').pop()
        let newFile = {
          name: name,
          path: path,
          code: '',
          unseenLines: [],
          marker: makeMarker,
          editorOption: {
            tabSize: 2,
            mode: 'text/javascript',
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            line: true,
            readOnly: true,
            gutters: ['CodeMirror-linenumbers', 'breakpoints']
          }
        }
        let ext = path.split('.').pop()
        switch (ext) {
          case 'vue':
            newFile.editorOption.mode = 'script/x-vue'
            break
          case 'html':
            newFile.editorOption.mode = 'text/html'
            break
          case 'md':
            newFile.editorOption.mode = 'text/x-markdown'
            break
          case 'jsx':
            newFile.editorOption.mode = 'text/jsx'
            break
          default:
            newFile.editorOption.mode = 'text/javascript'
        }

        let fileChanged = vm.openFiles.find(file => file.path === path)
        if (fileChanged) {
          // diff line changed
          let diff = JsDiff.diffLines(fileChanged.code, response.body)
          fileChanged.unseenLines = this.addUnseenLine(diff)
          fileChanged.code = response.body
        } else {
          newFile.code = response.body
          var index = vm.openFiles.findIndex(file => file.path === vm.currentOpenFilePath)
          vm.openFiles.splice(index + 1, 0, newFile)
          vm.currentOpenFilePath = path
        }
      }, (response) => {
        console.log(response)
      })
    },
    openFile (path) {
      this.removeUnseenFile(path)
      let vm = this
      if (!vm.openFiles.find(file => file.path === path)) {
        vm.getFile(path)
      } else {
        vm.currentOpenFilePath = path
      }
    },
    closeFile: function (path) {
      var index = this.openFiles.findIndex(file => file.path === path)
      this.openFiles.splice(index, 1)
      if (this.currentOpenFilePath === path) {
        let newIndex = (index <= 0) ? index : index - 1
        if (this.openFiles.length === 0) {
          this.currentOpenFilePath = ''
        } else {
          this.currentOpenFilePath = this.openFiles[newIndex].path
        }
      }
    },
    addUnseenFile: function (path) {
      if (!this.unseenFilePaths.find(unseen => unseen === path)) {
        this.unseenFilePaths.push(path)
        var subPaths = path.split('/')
        subPaths.shift()
        subPaths.shift()
        subPaths.forEach(subPath => {
          var newPath = path.substring(0, path.search('/' + subPath))
          this.unseenFolderPaths.push({path: newPath + '/', file: path})
        })
      }
    },
    removeUnseenFile: function (path) {
      var vm = this
      let index = this.unseenFilePaths.indexOf(path)
      if (index !== -1) {
        this.unseenFilePaths.splice(index, 1)
        let isOpen = this.unseenFolderPaths.filter(folder => folder.file === path)
        isOpen.forEach(() => {
          let indexFolder = vm.unseenFolderPaths.findIndex(folder => folder.file === path)
          if (indexFolder !== -1) vm.unseenFolderPaths.splice(indexFolder, 1)
        })
      }
    },
    addUnseenLine: function (diff) {
      let count = 0
      var lines = []
      diff.forEach(item => {
        if (item.added === undefined && item.removed === undefined) {
          count += item.count
        }
        if (item.added) {
          if (item.count > 1) {
            for (var i = 0; i < item.count; i++) {
              lines.push(parseInt(count))
              count++
            }
          } else {
            lines.push(parseInt(count))
            count += item.count
          }
        }
      })
      return lines
    },
    isUnseenTab (file) {
      return this.unseenFilePaths.find(path => path === file)
    },
    async downloadZip () {
      await Promise.all([this.getZip(this.list), this.saveFileSaver(this.list)])
    },
    async saveFileSaver (list) {
      zip.generateAsync({type: 'blob'}).then(async function (blob) {
        await FileSaver.saveAs(blob, list.name + '.zip')
      })
    },
    async getZip (lists) {
      var vm = this
      lists.children.forEach(list => {
        var type = list.path.split('.').pop().toUpperCase()
        if (list.type === 'directory') {
          this.getZip(list)
        } else if (list.type === 'file' && (type === 'PNG' || type === 'JPG' || type === 'JPEG' || type === 'ICO' || type === 'SVG' || type === 'GIF')) {
          var img = document.createElement('img')
          img.src = 'files' + list.path
          img.onload = async function () {
            var c = document.createElement('canvas')
            c.width = this.naturalWidth
            c.height = this.naturalHeight
            c.getContext('2d').drawImage(this, 0, 0)
              // Get raw image data
            var imgData = await c.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')
            // save image file
            zip.file(vm.list.name + list.path, imgData, {base64: true})
          }
        } else if (list.type === 'file') {
          // save file
          this.$http.get('/files' + list.path).then((response) => {
            zip.file(vm.list.name + list.path, response.body, {binary: true})
          })
        }
      })
    }
  },
  components: {
    Item,
    Viewer
  }
}
</script>

<style lang="scss">
html, body {
  background-color: #202A2F;
  color: #9AAEB7;
  overflow: hidden;
  margin: 0;
  padding: 0;
}::-webkit-scrollbar-track{
  border-radius: 10px;
}
::-webkit-scrollbar{
  width: 6px;
}
::-webkit-scrollbar-thumb{
  border-radius: 10px;
  background-color: #394545;
}
.app {
  background: #FFF;
  height: 100vh;
  background: #202A2F;
  .left {
    overflow: auto;
    display: inline-block;
    width: 15vw;
    height: 100vh;
    font-family: 'BlinkMacSystemFont', 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    .tree {
      height: 92vh;
    }
    .download-button {
      width: 12vw;
      height: 3vh;
      margin-left: 1vw;
      padding-top: 12px;
      text-align: center;
      position: relative;
      text-decoration: none;
      border: 1px solid #E3E3E3;
      background-color: #263238;
      transition: 0.1;
      cursor: pointer;
    }
    .download-button:focus,
    .download-button:hover {
      border-color: #E31A4C;
      outline: none;
    }
    .download-button:active {
      animation: enlight 0.5s;
    }
    .download-button::before {
      content: '';
      background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/2037/download.svg') no-repeat center;
      position: absolute;
      top: 10px;
      left: 0px;
      height: 2vh;
      width: 2.5vw ;
    }
  }
  .right {
    float: right;
    display: inline-block;
    width: 85vw;
    height: 100vh;
    padding-top: 8px;
    .tabs {
      display: block;
      width: auto;
      height: 40px;
      overflow-x: auto;
      overflow-y: hidden;
      margin: 0px;
      padding-left: 0px;
      padding-right: 10px;
      &::-webkit-scrollbar {
        display: none;
      }
      .tabs-tab {
        margin: 0px;
        display: inline-block;
        box-sizing: border-box;
        height: 40px;
        line-height: 40px;
        width: 200px;
        text-align: center;
        color: #666c77;
        overflow: hidden;
        padding-right: 10px;
        cursor: pointer;
        user-select: none;
        font-family: 'BlinkMacSystemFont', 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        &:hover {
          color: #ccc;
        }
        &.is-active {
          background: #263238;
          border-radius: 3px 3px 0px 0px;
          border-left: 2px solid #58C6FC;
          border-right: 1px solid #171E22;
          border-top: 1px solid #171E22;
          border-bottom: 1px solid #263238;
          color: #ccc;
        }
        .tabs-tab-name {
          width: 160px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .item-views {
      display: block;
      height: 100%;
      border-top: 1px solid #171E22;
      border-left: 1px solid #171E22;
      border-right: 1px solid #171E22;
      margin-right: 10px;
    }
  }
}
.CodeMirror {
  height: calc(100vh - 48px) !important;
}
.item {
  cursor: pointer;
  user-select: none;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1.2em;
  line-height: 1.5em;
  white-space: nowrap;
}
li {
  list-style-type: none;
  &.is-unseen {
    color: #EAB877;
  }
  &.is-active {
    color: #ffffff;
    background-color: #263238;
  }
  &.is-active-unseen {
    color: #EAB877;
    background-color: #263238;
  }
  &.is-none {
    color: #9aaeb7;
  }
}
</style>
