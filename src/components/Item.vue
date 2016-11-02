<template lang="html">
  <li :class="{'is-active': currentOpenFilePath === model.path, 'is-unseen': isUnseen, 'is-none': isNone}">
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
        :unseen-file-paths="unseenFilePaths"
        :unseen-folder-paths="unseenFolderPaths"
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
    currentOpenFilePath: String,
    unseenFilePaths: Array,
    unseenFolderPaths: Array
  },
  computed: {
    isFolder: function () {
      return this.model.type === 'directory'
    },
    isUnseenFile: function () {
      return this.unseenFilePaths.find(path => path === this.model.path)
    },
    isUnseenFolder: function () {
      return this.unseenFolderPaths.find(folder => folder.path === this.model.path)
    },
    isUnseen: function () {
      return this.isUnseenFile || this.isUnseenFolder
    },
    isNone: function () {
      return (!this.isUnseenFile && !this.isUnseenFolder && this.currentOpenFilePath !== this.model.path)
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
