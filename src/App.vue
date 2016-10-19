<template lang="html">
  <ul class="">
    <item
      class="item"
      :model="list">
    </item>
  </ul>
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
      }
    }
  },
  computed: {},
  mounted () {
    let vm = this
    var socket = io.connect('http://localhost:3000')
    socket.on('list', function (list) {
      vm.list.children = list
    })
    socket.on('change', function (msg) {
      console.log('change ' + msg)
    })
  },
  methods: {
  },
  components: {
    Item
  }
}
</script>
<style lang="css">
body {
  font-family: Menlo, Consolas, monospace;
  color: #444;
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
