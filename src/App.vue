<template lang="html">
  <div class="app" @mousemove="mousemove" @mouseup="mouseUp">
    <div class="left" :style="{ 'width': divLeft + 'px' }">
      <div class="tree">
        <ul>
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
        <i class="fa fa-download" aria-hidden="true"></i>&nbsp;
        {{list.name}}.zip
      </div>
    </div>
    <div class="resize" @mousedown="mouseDown"></div>
    <div class="right" :style="{ 'width': divRight + 'px' }">
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
import JsDiff from 'diff'
import JSZip from 'jszip'
import FileSaver from 'file-saver'

const zip = new JSZip()

function makeMarker () {
  let marker = document.createElement('div')
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
      unseenLine: [],
      mousePress: false,
      divLeft: 200
    }
  },
  computed: {
    divRight () {
      return (window.innerWidth - this.divLeft) - 10
    }
  },
  mounted () {
    let vm = this
    const socket = io.connect()
    socket.on('list', (list) => {
      if (list.name.lastIndexOf('\\') !== -1) {
        list.name = list.name.substring(list.name.lastIndexOf('\\') + 1, list.name.length)
      }
      vm.list = list
    })
    socket.on('change', (path) => {
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
            tabSize: 4,
            mode: 'text/javascript',
            theme: 'material',
            lineNumbers: true,
            lineWrapping: false,
            line: true,
            readOnly: true,
            gutters: ['CodeMirror-linenumbers', 'breakpoints']
          }
        }
        const ext = path.split('.').pop()
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
          case 'css':
            newFile.editorOption.mode = 'text/css'
            break
          default:
            newFile.editorOption.mode = 'text/javascript'
        }

        let fileChanged = vm.openFiles.find(file => file.path === path)
        if (fileChanged) {
          // diff line changed
          let code = (typeof response.body === 'string') ? response.body : ''
          let diff = JsDiff.diffLines(fileChanged.code, code)
          fileChanged.unseenLines = this.addUnseenLine(diff)
          fileChanged.code = code
        } else {
          newFile.code = (typeof response.body === 'string') ? response.body : ''
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
      if (!this.openFiles.find(file => file.path === path)) {
        this.getFile(path)
      } else {
        this.currentOpenFilePath = path
      }
    },
    closeFile: function (path) {
      const index = this.openFiles.findIndex(file => file.path === path)
      this.openFiles.splice(index, 1)
      if (this.currentOpenFilePath === path) {
        const newIndex = (index <= 0) ? index : index - 1
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
        let subPaths = path.split('/')
        subPaths.shift()
        subPaths.shift()
        subPaths.forEach(subPath => {
          const newPath = path.substring(0, path.search('/' + subPath))
          this.unseenFolderPaths.push({path: newPath + '/', file: path})
        })
      }
    },
    removeUnseenFile: function (path) {
      const index = this.unseenFilePaths.indexOf(path)
      if (index !== -1) {
        this.unseenFilePaths.splice(index, 1)
        const isOpen = this.unseenFolderPaths.filter(folder => folder.file === path)
        isOpen.forEach(() => {
          const indexFolder = this.unseenFolderPaths.findIndex(folder => folder.file === path)
          if (indexFolder !== -1) this.unseenFolderPaths.splice(indexFolder, 1)
        })
      }
    },
    addUnseenLine: function (diff) {
      let count = 0
      let lines = []
      diff.forEach(item => {
        if (item.added === undefined && item.removed === undefined) {
          count += item.count
        }
        if (item.added) {
          if (item.count > 1) {
            for (let i = 0; i < item.count; i++) {
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
      await this.getZip(this.list)
      const blob = await zip.generateAsync({type: 'blob'})
      FileSaver.saveAs(blob, this.list.name + '.zip')
    },
    async getZip (lists) {
      for (const list of lists.children) {
        const type = list.path.split('.').pop().toUpperCase()
        if (list.type === 'directory') {
          await this.getZip(list)
        } else if (list.type === 'file' && (type === 'PNG' || type === 'JPG' || type === 'JPEG' || type === 'ICO' || type === 'SVG' || type === 'GIF')) {
          const imgData = await this.promiseImage(list)
          zip.file(this.list.name + list.path, imgData, {base64: true})
        } else if (list.type === 'file' && type !== 'MAP') {
          const response = await this.$http.get('/files' + list.path)
          zip.file(this.list.name + list.path, response.body, {binary: true})
        }
      }
    },
    promiseImage (list) {
      return new Promise((resolve, reject) => {
        let img = document.createElement('img')
        img.src = 'files' + list.path
        img.onload = function () {
          let c = document.createElement('canvas')
          c.width = this.naturalWidth
          c.height = this.naturalHeight
          c.getContext('2d').drawImage(this, 0, 0)
          resolve(c.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''))
        }
      })
    },
    mouseDown (e) {
      this.mousePress = true
    },
    mousemove (e) {
      if (this.mousePress) {
        this.divLeft = e.screenX
      }
    },
    mouseUp (e) {
      this.mousePress = false
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
  height: 6px;
}
::-webkit-scrollbar-thumb{
  border-radius: 10px;
  background-color: #394545;
}
.app {
  background: #FFF;
  height: 100vh;
  background: #202A2F;
  .resize {
    background-color: #1a1b1c;
    display: inline-block;
    width: 2px;
    height: 100vh;
    cursor: col-resize;
  }
  .left {
    overflow-x: hidden;
    display: inline-block;
    height: 100vh;
    font-family: 'BlinkMacSystemFont', 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    .tree {
      height: 92vh;
      display: inline-block;
      margin-bottom: 0%;
    }
    .download-button {
      margin: 0 2vw;
      padding: 12px;
      text-align: center;
      position: relative;
      text-decoration: none;
      border: 1px solid #E3E3E3;
      background-color: #263238;
      transition: 0.1;
      cursor: pointer;
      line-height: 10px;
      white-space: -moz-pre-wrap !important;  /* Mozilla, since 1999 */
      white-space: -webkit-pre-wrap; /*Chrome & Safari */
      white-space: -pre-wrap;      /* Opera 4-6 */
      white-space: -o-pre-wrap;    /* Opera 7 */
      white-space: pre-wrap;       /* css-3 */
      word-wrap: break-word;       /* Internet Explorer 5.5+ */
      word-break: break-all;
      white-space: normal;
    }
    .download-button:focus,
    .download-button:hover {
      border-color: #58C6FC;
      outline: none;
    }
    .download-button:active {
      animation: enlight 0.5s;
    }
  }
  .right {
    float: right;
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
.CodeMirror {
   font-size: 1.2em;
}
pre.CodeMirror-line {
  padding-left: 10px !important;
}
</style>
