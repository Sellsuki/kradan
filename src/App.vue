<template lang="html">
  <div class="app">
    <div class="directory">
      <item class="item" :model="list" :open-file="openFile">
      </item>
    </div>
    <div class="box">
      <ul class="menu">
        <li class="">
          <div class="fileName">kradan.code</div>
          <div class="close-icon"></div>
        </li>
      </ul>
      <article class="code">
        <ol class="lines">
         <!-- <li v-for="(code,index) in codes"><pre>{{index+1}}&nbsp&nbsp&nbsp&nbsp&nbsp<code v-html="highlightCode(code)"></code></pre></li> -->
         <pre class="pre"><code v-html="highlightCode"></code></pre><br><br><br><br><br><br>
       </ol>
      </article>
    </div>
  </div>
</template>

<script>
/* global io */
import Item from 'components/Item'
import hljs from 'highlight.js'

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
  computed: {
    highlightCode () {
      return hljs.highlightAuto(this.file).value
    }
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
@import url("../node_modules/highlight.js/styles/atom-one-dark.css");
body {
  font-family: Menlo, Consolas, monospace;
  background-color: #202A2F;
  color: #9AAEB7;
  overflow: hidden;

}

.item {
  cursor: pointer;
  font-size: 1.0em;
  line-height: 1.7em;
}

.bold {
  font-weight: bold;
  font-size: 1.2em;
}

ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}

.directory {
  background-color: #21252b;
  height: 100%;
  position: absolute;
  display: inline-block;
  color: #abb2bf;
  overflow: auto;
  border-right: #0a0b12 1px solid;
  padding-top: 30px;
  padding-left: 15px;
  min-width: 300px;
  width: 15%;
}
  .directory::-webkit-scrollbar {
      width: 5px;
  }
  .directory::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
  }
  .directory::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
  }

.box {
  background-color: #292e37;
  height: 100%;
  display: inline-block;
  position: absolute;
  right: 0px;
  top: 0px;
  color: #abb2bf;
  overflow: hidden;
  border-right: #0a0b12 1px solid;
  width: 85%;
}

.menu {
  background-color: #21252b;
  display: flex;
  height: 3em;
  padding-top: 7px;
}
  .menu li {
    flex: 1;
    min-width: 7em;
    height: 3em;
    line-height: 3em;
    padding: 0;
    margin: 0;
    text-align: center;
    display: inline-block;
    background-color: #21252b;
    color: #666c77;
    cursor: default;
    border-bottom: solid #181a1f 1px;
  }
    .menu li .fileName {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-overflow: clip;
      /*mask: linear-gradient(to left, transparent, #000000 1em) no-repeat;*/
      margin: 0 0em;
      width: 300px;
      /*color: #d7dae0;*/
      color: #abb2bf;
      background-color: #282c34;
      border-left: 2px #528bff solid;
      border-top: 1px #353840 solid;
      border-right: 1px #2c3038 solid;
      border-bottom: 1px #282c34 solid;
    }

.code {
  font-family: "Cousine", monospace;
  font-size: 1.2em;
  /*line-height: 0.4em;*/
  font-weight: normal;
  cursor: text;
  height: 100%;
  margin-left: 2px;
  /*overflow: auto;*/
}

.pre {
  overflow: hidden;
}
/*.lines li {
  counter-increment: item;
  padding-left: 6em;
  margin-left: -4em;
  border-left-width: 2px;
  border-left-style: solid;
  border-left-color: transparent;
  color: #abb2bf;
  }*/
ol.lines {
  counter-reset: item;
  list-style-type: none;
  width: 100%;
  border-left-width: 1em;
  border-left-color: transparent;
  border-left-style: solid;
  padding-top: 1em;
  padding-bottom: 1em;
  height: 100%;
  overflow: auto;
  line-height: 1.4em;
  /*overflow-y: auto;*/
}
/*ol.lines::-webkit-scrollbar {
    width: 5px;
}
ol.lines::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
}
ol.lines::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
}*/

</style>
