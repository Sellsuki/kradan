<template lang="html">
  <li>
    <div
      :class="{bold: isFolder}"
      @click="onClick">
      <span v-if="isFolder">{{open ? '▼' : '▶'}}</span>
      {{model.name}}
    </div>
    <ul v-show="open" v-if="isFolder">
      <item
        class="item"
        v-for="model in model.children"
        :model="model"
        @openFile="openFile">
      </item>
    </ul>
  </li>
</template>

<script>
import Item from './Item'
export default {
  name: 'item',
  data () {
    return {
      open: false
    }
  },
  mounted () {
    if (this.model.path === '/') {
      this.open = true
    }
  },
  props: {
    model: Object
  },
  computed: {
    isFolder: function () {
      return this.model.type === 'directory'
    }
  },
  methods: {
    openFile (path) {
      this.$emit('openFile', path)
    },
    onClick: function () {
      if (this.isFolder) {
        this.open = !this.open
      } else {
        this.$emit('openFile', this.model.path)
      }
    }
  },
  components: {Item}
}
</script>

<style lang="css">
</style>
