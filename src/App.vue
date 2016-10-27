<template lang="html">
  <div class="app">
    <div class="left">
      <ul class="overflow-scroll">
        <item
          class="item"
          :model="list"
          @openFile="openFile">
        </item>
      </ul>
    </div>
    <div class="right">
      <div class="tabs">
        <div class="tabs-tab" v-for="file in openFiles" :class="{'is-active': currentOpenFilePath === file.path}" @click.self="openFile(file.path)">
          {{file.name}}
          <span class="icon" @click="closeFile(file.path)" style="float: right;">
            <i class="fa fa-close" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <div class="item-views">
        <div v-for="openFile in openFiles">
          <viewer v-if="currentOpenFilePath === openFile.path" :info="openFile"></viewer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global io */
import Item from 'components/Item'
import Viewer from 'components/Viewer'

export default {
  data () {
    return {
      list: {
        name: 'Root',
        path: '/',
        children: []
      },
      currentOpenFilePath: '',
      openFiles: []
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
          editorOption: {
            tabSize: 2,
            mode: 'text/javascript',
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            line: true,
            readOnly: true
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
      let vm = this
      if (!vm.openFiles.find(file => file.path === path)) {
        vm.getFile(path)
      } else {
        vm.currentOpenFilePath = path
      }
    },
    title: function (checkStyle) {
      var style = 'fileTitle'
      if (checkStyle) {
        style = 'fileTitleSelect'
      }
      return style
    },
    closeFile: function (path) {
      var index = this.openFiles.findIndex(file => file.path === path)
      this.openFiles.splice(index, 1)
      if (this.currentOpenFilePath === path) {
        let newIndex = (index <= 0) ? index : index - 1
        this.currentOpenFilePath = this.openFiles[newIndex].path
      }
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
}

.app {
  background: #FFF;
  height: 100vh;
  background: #202A2F;
  .left {
    overflow: auto;
    display: inline-block;
    width: 20vw;
    height: 100vh;
    font-family: 'BlinkMacSystemFont', 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
  }
  .right {
    float: right;
    display: inline-block;
    width: 80vw;
    height: 100vh;
    .tabs {
      display: block;
      width: 100%;
      height: 40px;
      padding-top: 8px;
      overflow: hidden;
      .tabs-tab {
        display: inline-block;
        box-sizing: border-box;
        float: left;
        height: 40px;
        line-height: 40px;
        width: 20%;
        max-width: 200px;
        min-width: 150px;
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
      }
      .is-active {
        background: #263238;
        border-radius: 3px 3px 0px 0px;
        border-left: 2px solid #58C6FC;
        border-right: 1px solid #171E22;
        border-top: 1px solid #171E22;
        border-bottom: 1px solid #263238;
        color: #ccc;
      }
    }
    .item-views {
      background: #263238;
      display: block;
      height: 100%;
      border-top: 1px solid #171E22;
      border-left: 1px solid #171E22;
      border-right: 1px solid #171E22;
      margin-right: 10px;
    }
  }
}
.overflow-scroll {
  height: 100vh;
  max-height: 100vh;
  -webkit-overflow-scrolling: touch;
  overflow: scroll;
}
.CodeMirror {
  height: calc(100vh - 48px) !important;
}
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1.2em;
  line-height: 1.5em;
  list-style-type: dot;
  white-space: nowrap;
}
li {
  list-style-type: none;
}
</style>
