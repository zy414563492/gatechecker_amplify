import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

// import {
//   applyPolyfills,
//   defineCustomElements,
// } from '@aws-amplify/ui-components/loader';

import Amplify, { AuthModeStrategyType } from "aws-amplify"
// import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync'
import awsconfig from './aws-exports'
import "@aws-amplify/ui-vue/styles.css"


// // 设置全局访问模式为API_KEY
// Vue.prototype.$client = new AWSAppSyncClient({
//   url: awsconfig.aws_appsync_graphqlEndpoint,
//   region: awsconfig.aws_appsync_region,
//   auth: {
//     type: AUTH_TYPE.API_KEY,
//     apiKey: awsconfig.aws_appsync_apiKey,
//   },
// })

// applyPolyfills().then(() => {
//   defineCustomElements(window);
// });

Vue.config.ignoredElements = [/amplify-\w*/];

import axios from 'axios'
Vue.prototype.$axios = axios // 全局注册，使用方法为:this.$axios


Amplify.configure({
  ...awsconfig,
  DataStore: {
    authModeStrategyType: AuthModeStrategyType.MULTI_AUTH
  },
})

Vue.config.productionTip = false


new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
