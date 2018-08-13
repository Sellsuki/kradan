
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentOpenFilePath: '',
    openFiles: [],
    unseenFilePaths: []
  },
  mutations: {
    mutateCurrentOpenFilePath (state, path) {
      state.currentOpenFilePath = path
    },
    sliceOpenFiles (state, {index, newFile}) {
      state.openFiles.splice(index + 1, 0, newFile)
    },
    sliceUnseenFilePaths (state, { index, newFile }) {
      state.openFiles.splice(index + 1, 0, newFile)
    }
  },
  getters: {
    currentOpenFilePath (state) {
      return state.currentOpenFilePath
    },
    openFiles (state) {
      return state.openFiles
    },
    unseenFilePaths (state) {
      return state.unseenFilePaths
    }
  }
})
