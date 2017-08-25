<template lang="html">
  <div>
    <codemirror v-if="!isImage" :code="info.code" :options="info.editorOption" :unseen-lines="info.unseenLines" :marker="info.marker"></codemirror>
    <div v-if="isImage" class="image-container">
      <img :src="'files/' + info.path" alt="" />
    </div>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
export default {
  data () {
    return {}
  },
  props: ['info', 'unseenLine'],
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
  mounted () {},
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
