<template>
   <v-app>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
            <v-flex xs12 sm8 md4>
              <v-card class="elevation-12">
                  <v-toolbar dark color="primary">
                    <v-toolbar-title>{{ name }}</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text>
                    <v-form>
                      <!-- 方法１ -->
                      <v-text-field
                        prepend-icon="mdi-account"
                        name="user_id"
                        label="ユーザーID"
                        type="text"
                        v-model="user_id"
                      ></v-text-field>
                      
                      <!-- 方法２ -->
                      <v-text-field
                        name="building_id"
                        label="施設ID"
                        type="text"
                        v-model="building_id"
                      >
                        <v-icon
                          slot="prepend"
                        >
                          mdi-office-building-marker
                        </v-icon>
                      </v-text-field>
                      <v-alert
                        dense
                        outlined
                        type="error"
                        border="left"
                        v-if="error_flg"
                      >
                        {{ error_msg }}
                      </v-alert>
                    </v-form>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="login">現場確認</v-btn>
                  </v-card-actions>
              </v-card>
            </v-flex>
        </v-layout>
      </v-container>
   </v-app>
</template>

<script>
// import { API, graphqlOperation } from 'aws-amplify'
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { countInfo } from '../graphql/queries'
import store from '../store'

import { DataStore } from '@aws-amplify/datastore'
import { User } from '@/models'

import gql from 'graphql-tag'


export default {
  props: {
    source: String,
  },

  data: () => ({
    name: 'Login',
    user_id: null,
    building_id: null,
    error_flg: false,
    error_msg: null,
    count_info: null,
  }),

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      // 直接访问的话默认是用的user_pool，会报错没有当前用户，因此这里用AWSAppSyncClient手动调用API_KEY进行认证
      // const response = await API.graphql(graphqlOperation(countInfo))
      const response = await this.$client.query({
        query: gql(countInfo)
      })
      const response_obj = JSON.parse(response.data.countInfo)
      console.log(response_obj)
      this.count_info = response_obj.count_info
    },

    searchInfo (item, uid, bid) {
      var match_idx = -1
      for (var idx = 0; idx < item.length; idx++) {
        if (item[idx].uid === uid && item[idx].bid === bid) {
          match_idx = idx
          break
        }
      }
      return match_idx
    },

    login () {
      console.log("count_info:\n", this.count_info)
      console.log("user_id:\n", this.user_id)
      console.log("building_id:\n", this.building_id)

      var match_idx = this.searchInfo(this.count_info, this.user_id, this.building_id)
      console.log(`match_idx = ${match_idx}`)
      if (match_idx < 0) {
        console.log("No matched Information.")
      } else {
        this.$router.push({
          path: '/',
          query: {
            count_info: this.count_info[match_idx],
          },
        })
      }

    },

    // login () {
    //   // 一些其他校验及其他操作，如校验用户名密码是否为空
  
    //   // 请求登陆接口
    //   this.$axios.post('/api/get_count_single', {
    //     user_id: this.user_id,
    //     building_id: this.building_id,
    //   })
    //     .then(res => {
    //       // 登陆成功相关操作
    //       if (res.data.status == 'success') {
    //         let count_info = res.data.count_info
    //         console.log(count_info)

    //         // console.log("Get Logged")
    //         // store.commit('validAuth')

    //         // 跳转到结果页面
    //         this.$router.push({
    //           path: '/result',
    //           query: {
    //             count_info: count_info,
    //           },
    //         })
    //       }
    //       else {
    //         // 登录失败，不跳转并提示错误
    //         this.error_flg = true
    //         this.error_msg = res.data.error_msg
    //         console.log(this.error_msg)
    //       }
    //     })
    //     .catch(err => {
    //       console.log('Failed to connect with MySQL')
    //     })
    //   },
    // },

  }
};
</script>

<style></style>
