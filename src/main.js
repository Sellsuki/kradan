// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store'
import axios from 'axios'
import 'codemirror/lib/codemirror.css'

let host = null

Vue.prototype.$isProduction = process.env.NODE_ENV === 'production'
Vue.config.performance = true

if (process.env.NODE_ENV !== 'production') {
  host = 'localhost:1112'
} else {
  host = window.location.href.replace('http://', '').replace('https://', '').replace('/', '')
}

let baseApiUrl = `//${host}/`

Vue.prototype.$baseApiUrl = baseApiUrl
Vue.prototype.$host = host

Vue.prototype.$http = axios.create({
  baseURL: baseApiUrl
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
