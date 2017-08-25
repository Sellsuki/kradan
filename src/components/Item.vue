<template lang="html">
  <li :class="{'is-active-unseen': isActiveUnseen, 'is-active': currentOpenFilePath === model.path, 'is-unseen': isUnseen, 'is-none': isNone}">
    <div
      @click="onClick">
      <span v-if="isFolder">{{open ? '▼  ' : '▶ '}}</span>
      <img :src="isIcon" width="15px" height="15px">
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
    },
    isActiveUnseen: function () {
      return this.currentOpenFilePath === this.model.path && this.isUnseen
    },
    isIcon () {
      const icon = this.model.name.split('.').pop(-1)
      if (this.model.type === 'directory') return '../../static/folder.png'
      else if (this.model.name === 'package.json') return '../../static/npm.png'
      else if (this.model.name === 'yarn.lock') return '../../static/yarn.png'
      switch (icon) {
        case 'js': return '../../static/js.png'
        case 'log': return '../../static/log.ico'
        case 'png': return '../../static/pic.png'
        case 'ico': return '../../static/pic.png'
        case 'jpg': return '../../static/pic.png'
        case 'html': return '../../static/html.png'
        case 'vue': return '../../static/vue.png'
        case 'css': return '../../static/css.png'
        case 'md': return '../../static/md.png'
        case 'editorconfig': return '../../static/eslint.png'
        case 'eslintignore': return '../../static/eslint.png'
        case 'babelrc': return './../static/babel.png'
        case 'jsx': return '../../static/jsx.png'
        case 'ts': return '../../static/ts.png'
      }
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
