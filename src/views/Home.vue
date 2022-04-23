<template>
   <v-app>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>{{ name }}</v-toolbar-title>
              </v-toolbar>

              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <v-subheader>{{ "施設名：" + target_count_info.name }}</v-subheader>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <v-subheader>本日の入場者数</v-subheader>
                  </v-col>

                  <v-col cols="6">
                    <v-subheader>本日の退場者数</v-subheader>
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      name="count_enter"
                      type="text"
                      suffix="名"
                      v-model="target_count_info.count_enter"
                      readonly
                      solo
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      name="count_exit"
                      type="text"
                      suffix="名"
                      v-model="target_count_info.count_exit"
                      readonly
                      solo
                    >
                    </v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <v-subheader>今場内にいる人数</v-subheader>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      name="count_inside"
                      type="text"
                      suffix="名"
                      v-model="target_count_info.count_inside"
                      readonly
                      solo
                    >
                    </v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-alert
                      outlined
                      prominent
                      text
                      type="success"
                      v-if="target_count_info.has_blacklist == false"
                    >
                      ブラックリスト未検出
                    </v-alert>
                    <v-alert
                      outlined
                      prominent
                      text
                      type="error"
                      v-else
                      @click="showAlarmDetails()"
                    >
                      ブラックリスト検出
                      <v-icon
                        slot="append"
                        @click="deleteItem()"
                      >
                        mdi-timer-off-outline
                      </v-icon>
                    </v-alert>
                  </v-col>
                </v-row>

                <!-- <v-row>
                  <v-col cols="6">
                   <v-btn color="primary" v-on:click="showUpdateCnt">showUpdateCnt</v-btn>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                   <v-btn color="primary" v-on:click="test">TEST</v-btn>
                  </v-col>
                </v-row> -->

              </v-card-text>
          </v-card>
        </v-layout>

        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5 justify-center">当施設のアラームを解消しますか？</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">キャンセル</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">確定</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-container>
   </v-app>
</template>

<script>
import { API, graphqlOperation } from 'aws-amplify'
import { countInfo } from '../graphql/queries'
import { clearAlarm } from '../graphql/mutations'
import { onCreateLog, onDeleteLog } from '../graphql/subscriptions'
import gql from 'graphql-tag'

let g_updateCnt = 0;

export default {
  // props: {
  //   user_id: String,
  //   building_id: String,
  //   callback: Function,
  // },

  data: () => ({
    name: '現場確認',
    user_id: null,
    building_id: null,
    dialogDelete: false,
    loginItem: {
      uid: null,
      bid: null,
    },
    count_info: null,
    target_count_info: {
      id: null,
      bid: null,
      uid: null,
      name: null,
      to_user: null,
      count_enter: null,
      count_exit: null,
      count_inside: null,
      has_blacklist: null,
      alarm_details: null,
    },
    updateCnt: 0,
  }),

  async created () {
    this.checkURL()
    await this.initialize()
    this.setSubscription()
  },

  // watch: { // 实时检测
  //   "g_updateCnt": function (newValue, oldValue) {
  //     console.log("g_updateCnt = ", newValue, oldValue)
  //   }
  // },

  mounted () {
    this.$nextTick(() => {
      setInterval(this.refresh, 5000);
    })
  },

  methods: {
    // showUpdateCnt () {
    //   console.log("g_updateCnt: ", g_updateCnt)
    // },
    // test () {
    //   console.log("this.updateCnt", this.updateCnt)
    // },
    checkURL () {
      let user_id = this.$route.query.user_id
      let building_id = this.$route.query.building_id

      // URLでの直接アクセスは禁止にする
      if (!user_id) {
        // 跳转到登录页面
        this.$router.push('/login')
        return
      }

      this.user_id = user_id
      this.building_id = building_id
    },

    async getCountInfo () {
      // 直接访问的话默认是用的user_pool，会报错没有当前用户，因此这里用AWSAppSyncClient手动调用API_KEY进行认证
      // const response = await API.graphql(graphqlOperation(countInfo))
      var response = await this.$client.query({
        query: gql(countInfo),
        fetchPolicy: 'network-only'
      })
      var response_obj = JSON.parse(response.data.countInfo)
      console.log(response_obj)
      this.count_info = response_obj.count_info
    },

    searchInfo (item, uid, bid) {
      if(!item) {
        return -1
      }
      var match_idx = -1
      for (var idx = 0; idx < item.length; idx++) {
        if (item[idx].uid === uid && item[idx].bid === bid) {
          match_idx = idx
          break
        }
      }
      return match_idx
    },

    getTargetCountInfo () {
      console.log("[getTargetCountInfo...]")
      var match_idx = this.searchInfo(this.count_info, this.user_id, this.building_id)
      console.log(`match_idx = ${match_idx}`)
      if (match_idx < 0) {
        console.log("No matched Information.")
      } else {
        this.target_count_info = this.count_info[match_idx]
      }
    },

    async initialize () {
      console.log("[Initialize]")
      console.log("updateCnt in data: ", this.updateCnt)
      console.log("updateCnt in timer: ", g_updateCnt)
      await this.getCountInfo()
      this.getTargetCountInfo()
    },

    async refresh () {
      if (this.updateCnt != g_updateCnt) {
        console.log("[Refreshed]")
        console.log("updateCnt in data: ", this.updateCnt)
        console.log("updateCnt in timer: ", g_updateCnt)
        this.updateCnt = g_updateCnt
        await this.getCountInfo()
        this.getTargetCountInfo()
      }
    },

    setSubscription () {
      var realtimeResults = function realtimeResults(data) {
        console.log('[Realtime Subscription]\n', data)
        g_updateCnt = g_updateCnt + 1
      };
      
      const observable = this.$client.subscribe({
        query: gql(onCreateLog),
        fetchPolicy: 'network-only'
      }).subscribe({
        next: realtimeResults,
        // complete: console.log,
        // error: console.log,
      });
    },
    

    // async clearAlarm (item) {
    //   await this.$axios({
    //     method: 'post',
    //     url: '/api/clear_alarm_by_building_name',
    //     withCredentials: true,
    //     data: JSON.stringify(item)
    //   }).then((res) => {
    //     console.log(res)
    //   })
    // },

    async clearAlarm (item) {
      console.log(item)
      const response = await API.graphql(graphqlOperation(clearAlarm, { building_id: item }))
      console.log(response.data)
    },

    deleteItem () {
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      // 找到该设施的所有device，更新最近警报时间
      // this.clearAlarm({ "building_name": this.count_info.name })
      this.clearAlarm(this.target_count_info.name)

      // clear alarm in frontend table
      this.target_count_info.has_blacklist = false
      this.closeDelete()
    },

    closeDelete () {
      this.dialogDelete = false
    },

    showAlarmDetails () {
      console.log(this.target_count_info.alarm_details)
    },
  },
};
</script>

<style></style>
