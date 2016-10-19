// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

Vue.use(require('vue-resource'))

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
