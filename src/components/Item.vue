<template lang="html">
  <li :class="{'is-active': currentOpenFilePath === model.path}">
    <div
      @click="onClick">
      <span v-if="isFolder">{{open ? '▼' : '▶'}}</span>
      {{model.name}}
    </div>
    <ul v-show="open" v-if="isFolder">
      <item
        class="item"
        v-for="model in model.children"
        :model="model"
        :currentOpenFilePath="currentOpenFilePath"
        @openFile="openFile">
      </item>
    </ul>
  </li>
</template>

<script>
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
    model: Object,
    currentOpenFilePath: String
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
  }
}
</script>

<style lang="css">
</style>
