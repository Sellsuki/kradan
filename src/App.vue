<template lang="html">
  <section class="is-fullheight">
    <div class="columns is-marginless is-gapless is-desktop">
      <div class="column is-2-desktop">
        <ul class="overflow-scroll">
          <item
            class="item"
            :model="list"
            @openFile="openFile">
          </item>
        </ul>
      </div>
      <div class="column is-10-desktop is-editor">
        <div v-for="openFile in openFiles" v-show="currentOpenFilePath === openFile.path">
          <viewer :info="openFile"></viewer>
          <!-- <codemirror :code="openFile.code" :options="openFile.editorOption"></codemirror> -->
        </div>
      </div>
    </div>
  </section>
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
        let newFile = {
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
          vm.openFiles.push(newFile)
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
    }
  },
  components: {
    Item,
    Viewer
  }
}
</script>
<style lang="scss">
$column-gap: 0px;
@import '~bulma';

html, body {
  font-family: Menlo,Monaco,Consolas,Courier New,monospace!important;
  background-color: #202A2F;
  color: #9AAEB7;
  font-size: 18px;
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
