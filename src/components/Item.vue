<template lang="html">
  <li>
    <div
      :class="{bold: isFolder}"
      @click="toggle">
      {{model.name}}
      <span v-if="isFolder">[{{open ? '-' : '+'}}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <item
        class="item"
        v-for="model in model.children"
        :model="model">
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
      open: true
    }
  },
  props: {
    model: Object
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
    }
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    }
  },
  components: {Item}
}
</script>

<style lang="css">
</style>
