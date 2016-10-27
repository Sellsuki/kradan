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
      <div class="menuFile">
        <div :class="title(currentOpenFilePath === File.path)" v-for="File in openFiles" @click="openFile(File.path)">
          {{File.name}}
          <!-- <span class="icon" @click="closeFile(File)"> -->
          <span class="icon" @click="">
            <i class="fa fa-times" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <div v-for="openFile in openFiles" v-show="currentOpenFilePath === openFile.path">
        <viewer :info="openFile"></viewer>
          <!-- <codemirror :code="openFile.code" :options="openFile.editorOption"></codemirror> -->
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
          if (this.openFiles.length === 6) {
            var index = this.openFiles.findIndex(file => file.path === this.currentOpenFilePath)
            this.openFiles.splice(index, 1, newFile)
          } else {
            vm.openFiles.push(newFile)
          }
        }
      }, (response) => {
        console.log(response)
      })
    },
    openFile (path) {
      let vm = this
      vm.currentOpenFilePath = path
      if (!vm.openFiles.find(file => file.path === path)) {
        vm.getFile(path)
      }
    },
    title: function (checkStyle) {
      var style = 'fileTitle'
      if (checkStyle) {
        style = 'fileTitleSelect'
      }
      return style
    },
    closeFile: function (File) {
      if (File.path === this.currentOpenFilePath) {
        this.currentOpenFilePath = ''
      }
      var index = this.openFiles.findIndex(file => file.path === File.path)
      this.openFiles.splice(index, 1)
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
  font-family: Menlo,Monaco,Consolas,Courier New,monospace!important;
  background-color: #202A2F;
  color: #9AAEB7;
  font-size: 18px;
  overflow: hidden;
}
.app {
}
.left {
  display: inline-block;
  overflow: auto;
  width: 15%;
  -webkit-box-sizing:border-box;
   -moz-box-sizing:border-box;
   box-sizing:border-box;
}
.right {
  display: inline-block;
  width: 80%;
  -webkit-box-sizing:border-box;
   -moz-box-sizing:border-box;
   box-sizing:border-box;
}
.menuFile {
  background-color: #202A2F;
  height: 3em;
  line-height: 3em;
  padding: 0;
  margin: 0;
  cursor: default;
  display: flex;
}
.fileTitle {
  width: 290px;
  border-right: solid #181a1f 1px;
  border-bottom: solid #181a1f 1px;
  text-align: center;
  color: #666c77;
}
.fileTitleSelect {
  width: 290px;
  border-top: solid #181a1f 1px;
  border-right: solid #181a1f 1px;
  border-left: 2px #528bff solid;
  background-color: #26333b;
  text-align: center;
}
.overflow-scroll {
  height: 100vh;
  max-height: 100vh;
  -webkit-overflow-scrolling: touch;
  overflow: scroll;
}
.is-editor {
  background-color: #263238;
  border-left: 1px solid #171E22;
}
.CodeMirror {
  height: 100vh !important;
}
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
  white-space: nowrap;
}
</style>
