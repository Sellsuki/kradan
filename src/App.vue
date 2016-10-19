<template lang="html">
  <div class="">
    <ul class="">
      <item
        class="item"
        :model="list"
        @openFile="openFile">
      </item>
    </ul>
    <div class="">
      {{ file }}
    </div>
  </div>
</template>

<script>
/* global io */
import Item from 'components/Item'
// import hljs from 'highlight.js'

export default {
  data () {
    return {
      list: {
        name: 'Root',
        path: '/',
        children: []
      },
      file: ''
    }
  },
  computed: {},
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
      this.$http.get('http://localhost:3000/files' + path).then((response) => {
        vm.file = response.body
      }, (response) => {
        console.log(response)
      })
    }
  },
  components: {
    Item
  }
}
</script>
<style lang="css">
body {
  font-family: Menlo, Consolas, monospace;
  background-color: #202A2F;
  color: #9AAEB7;
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
