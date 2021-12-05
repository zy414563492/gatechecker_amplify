import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import {
  applyPolyfills,
  defineCustomElements,
} from '@aws-amplify/ui-components/loader';

import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
import "@aws-amplify/ui-vue/styles.css"

applyPolyfills().then(() => {
  defineCustomElements(window);
});

Vue.config.ignoredElements = [/amplify-\w*/];

import axios from 'axios'
Vue.prototype.$axios = axios // 全局注册，使用方法为:this.$axios


Amplify.configure(awsconfig)

Vue.config.productionTip = false

// 全局注册组件
import TopBar from '@/components/TopBar.vue'
import SideBar from '@/components/SideBar.vue'
import LinkBar from '@/components/LinkBar.vue'
Vue.component('top-bar', TopBar)
Vue.component('side-bar', SideBar)
Vue.component('link-bar', LinkBar)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
