<template lang="html">
  <div>
    <div :class="{bold: isFolder}" @click="onClick">
    <i :class="iconFolder"  v-show="isFolder">&nbsp&nbsp{{model.name}}</i>
    <i class="code icon" v-show="!isFolder" @click="openFile(model.path)">&nbsp&nbsp{{model.name}}</i>
    </div>
    <ul v-show="open" v-if="isFolder">
      <item class="item" v-for="model in model.children" :model="model" :open-file="openFile">
      </item>
    </ul>
  </div>
</template>

<script>
import Item from './Item'
export default {
  props: ['model', 'openFile'],
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
  computed: {
    isFolder: function () {
      return this.model.type === 'directory'
    },
    iconFolder: function () {
      var icon = 'folder icon'
      if (this.open) {
        icon = 'folder open icon'
      }
      return icon
    }
  },
  methods: {
    // openFile (path) {
    //   console.log('open0')
    //   this.$emit('openFile', path)
    // },
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
.code {
  cursor: pointer;
}
</style>
