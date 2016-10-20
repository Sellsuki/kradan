<template lang="html">
  <div>
    <codemirror v-if="type !== 'png'" :code="info.code" :options="info.editorOption"></codemirror>
    <div v-if="type === 'png'" class="image-container">
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
  props: ['info'],
  computed: {
    type () {
      return this.info.path.split('.').pop()
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
  width: 100%;
  height: 100vh;
  background: #f00;
  padding: 30px;
  background-color: white;
  background-image: url("../assets/transparent-background.png")
}
</style>
