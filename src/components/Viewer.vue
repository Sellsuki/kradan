<template lang="html">
  <div>
    <codemirror
    v-if="!isImage"
    :code="info.code"
    :options="info.editorOption"
    :unseen-lines="info.unseenLines"
    :marker="info.marker" />
    <div v-if="isImage" class="image-container">
      <img :src="$baseApiUrl + 'files/' + info.path" alt="" />
    </div>
  </div>
</template>

<script>

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/php/php.js'
import 'codemirror/mode/vue/vue.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/go/go.js'
import 'codemirror/mode/dockerfile/dockerfile.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/xml-fold.js'

export default {
  props: {
    info: Object,
    unseenLine: Array
  },
  computed: {
    isImage () {
      const type = this.info.path.split('.').pop()
      switch (type.toUpperCase()) {
        case 'PNG':
        case 'JPG':
        case 'JPEG':
        case 'ICO':
        case 'SVG':
        case 'GIF':
          return true
      }
      return false
    }
  },
  methods: {},
  components: {
    codemirror
  }
}
</script>

<style lang="css">
.image-container {
  text-align: center;
  border-radius: 3px;
  margin: 20px;
  padding: 30px;
  background-color: white;
  background-image: url("../assets/transparent-background.png");
}
img {
  max-height: 80vh;
  max-width: 100%;
}
</style>
