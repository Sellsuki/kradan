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
      <div class="column is-10-desktop">
        <codemirror :code="code" :options="editorOption"></codemirror>
      </div>
    </div>
  </section>
</template>

<script>
/* global io */
import Item from 'components/Item'
import { codemirror } from 'vue-codemirror'

export default {
  data () {
    return {
      list: {
        name: 'Root',
        path: '/',
        children: []
      },
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
  },
  computed: {
  },
  mounted () {
    let vm = this
    var socket = io.connect('http://localhost:3000')
    socket.on('list', function (list) {
      vm.list = list
    })
    socket.on('change', function (msg) {
      console.log('change ' + msg)
    })
  },
  methods: {
    openFile (path) {
      let vm = this
      // TODO : Fix editorOption.mode not reactive
      let ext = path.split('.').pop()
      switch (ext) {
        case 'vue':
          vm.editorOption.mode = 'script/x-vue'
          break
        case 'html':
          vm.editorOption.mode = 'text/html'
          break
        case 'md':
          vm.editorOption.mode = 'text/x-markdown'
          break
        case 'jsx':
          vm.editorOption.mode = 'text/jsx'
          break
        default:
          vm.editorOption.mode = 'text/javascript'
      }
      this.$http.get('http://localhost:3000/files' + path).then((response) => {
        vm.code = response.body
      }, (response) => {
        console.log(response)
      })
    }
  },
  components: {
    Item,
    codemirror
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
}
</style>
