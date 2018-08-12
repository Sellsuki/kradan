<template lang="html">
  <li :class="{'is-active-unseen': isActiveUnseen, 'is-active': currentOpenFilePath === model.path, 'is-unseen': isUnseen, 'is-none': isNone}">
    <div
      @click="onClick">
      <span v-if="isFolder">{{open ? '▼  ' : '▶ '}}</span>
      <img :src="isIcon" width="15px" height="15px">
      {{model.name}}
    </div>
    <ul v-if="open && isFolder">
      <item
        class="item"
        v-for="model in model.children"
        :model="model"
        :key="model.path"
        :unseen-file-paths="unseenFilePaths"
        :unseen-folder-paths="unseenFolderPaths"
        @openFile="openFile">
      </item>
    </ul>
  </li>
</template>
<script>
import { mapGetters } from 'vuex'
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
    unseenFilePaths: Array,
    unseenFolderPaths: Array
  },
  computed: {
    ...mapGetters([
      'currentOpenFilePath'
    ]),
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
      if (this.model.name === 'package.json') return require('@/assets/icons/file_type_npm.svg')
      else if (this.model.name === 'yarn.lock') return require('@/assets/icons/file_type_yarn.svg')
      else if (this.model.name === 'src') return require('@/assets/icons/folder_type_src_opened.svg')
      else if (this.model.name === 'public') return require('@/assets/icons/folder_type_public_opened.svg')
      else if (this.model.name === 'dist') return require('@/assets/icons/folder_type_dist_opened.svg')
      else if (this.model.name === 'tests') return require('@/assets/icons/folder_type_test_opened.svg')
      else if (this.model.type === 'directory') return require('@/assets/icons/default_folder_opened.svg')
      switch (icon) {
        case 'js': return require('@/assets/icons/file_type_js_official.svg')
        case 'log': return require('@/assets/icons/file_type_log.svg')
        case 'png': return require('@/assets/icons/file_type_image.svg')
        case 'ico': return require('@/assets/icons/file_type_image.svg')
        case 'jpg': return require('@/assets/icons/file_type_image.svg')
        case 'html': return require('@/assets/icons/file_type_html.svg')
        case 'vue': return require('@/assets/icons/file_type_vue.svg')
        case 'css': return require('@/assets/icons/file_type_css.svg')
        case 'md': return require('@/assets/icons/file_type_markdown.svg')
        case 'editorconfig': return require('@/assets/icons/file_type_editorconfig.svg')
        case 'eslintignore': return require('@/assets/icons/file_type_eslint.svg')
        case 'babelrc': return require('@/assets/icons/file_type_babel2.svg')
        case 'jsx': return require('@/assets/icons/file_type_reactjs.svg')
        case 'ts': return require('@/assets/icons/file_type_typescript_official.svg')
        case 'map': return require('@/assets/icons/file_type_map.svg')
        case 'svg': return require('@/assets/icons/file_type_svg.svg')
        case 'zip': return require('@/assets/icons/file_type_zip.svg')
        default: return require('@/assets/icons/default_file.svg')
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
