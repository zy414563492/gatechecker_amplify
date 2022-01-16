<template>
  <v-app>
    
    <link-bar :subLink="name"/>

    <v-data-table
      :headers="headers"
      :items="logs"
      class="elevation-1"
    >
      <template v-slot:[`item.deviceID`]="{ item }">
        {{ showDetailByID(item.deviceID) }}
      </template>

      <template v-slot:[`item.temperature`]="{ item }">
        <v-chip
          :color="getColor(item.temperature)"
          dark
        >
          {{ item.temperature }}
        </v-chip>
      </template>

      <template v-slot:[`item.is_blacklist`]="{ item }">
        <v-icon
          :color="getIconColor(item.is_blacklist)"
          class="mr-2"
        >
          {{ item.is_blacklist ? "mdi-alert-decagram" : "mdi-check-circle-outline"}}
        </v-icon>
      </template>
      
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>{{ name }}</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="warning"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                模擬検温記録を追加
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        v-model="editedItem.deviceID"
                        :items="devices"
                        item-text="detail.device_id"
                        item-value="id"
                        label="デバイスID"
                        outlined
                      >
                        <!-- <template slot="selection" slot-scope='{ item }'>
                          {{ `${ item.detail.device_id } (${ item.detail.is_entrance }, ${ item.detail.is_using })` }}
                        </template>
                        <template slot="item" slot-scope='{ item }'>
                          {{ `${ item.detail.device_id } (${ item.detail.is_entrance }, ${ item.detail.is_using })` }}
                        </template> -->
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="editedItem.log_id"
                        label="ログID"
                        outlined
                        :disabled="editedIndex !== -1"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="editedItem.time"
                        label="時間"
                        outlined
                        :hint="'例: ' + getdateTime()"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="editedItem.temperature"
                        label="体温"
                        outlined
                        type="number"
                        max="50"
                        min="30"
                        step="0.1"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        v-model="editedItem.is_blacklist"
                        :items="blacklist_state"
                        item-text="state_name"
                        item-value="state"
                        label="ブラックリスト検出"
                        outlined
                      >
                        <template slot='selection' slot-scope='{ item }'>
                          <v-icon
                            :color="getIconColor(item.state)"
                            class="mr-2"
                          >
                            {{ item.state ? "mdi-alert-decagram" : "mdi-check-circle-outline"}}
                          </v-icon>
                        </template>
                        
                        <template slot='item' slot-scope='{ item }'>
                          <v-icon
                            :color="getIconColor(item.state)"
                            class="mr-2"
                          >
                            {{ item.state ? "mdi-alert-decagram" : "mdi-check-circle-outline"}}
                          </v-icon>
                        </template>

                      </v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  キャンセル
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  保存
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5 justify-center">このアイテムを削除しますか？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">キャンセル</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">確定</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <!-- <template v-slot:item.actions="{ item }"> -->
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </template>
    </v-data-table>
  </v-app>
</template>

<script>
// import { DataStore } from '@aws-amplify/datastore'
// import { Device, Log } from '@/models'
import { API, graphqlOperation } from 'aws-amplify'
import { listLogs, listDevices } from '../graphql/queries'
import { createLog, updateLog, deleteLog } from '../graphql/mutations'

export default {
  data: () => ({
    name: '検温記録',
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'デバイスID', value: 'deviceID' },
      { text: 'ログID', value: 'log_id' },
      { text: '時間', value: 'time' },
      { text: '体温', value: 'temperature' },
      { text: 'ブラックリスト検出', value: 'is_blacklist' },
      { text: '操作', value: 'actions', sortable: false },
    ],
    devices: [],
    // devices中元素构造如下
    // device: {
    //   id: null,
    //   detail: {
    //     device_id: null,
    //     is_entrance: null,
    //     is_using: null,
    //   },
    // },
    logs: [],
    blacklist_state: [
      { state: true, state_name: '◯' },
      { state: false, state_name: '✖️' }
    ],
    editedIndex: -1,
    editedItem: {
      deviceID: null,
      log_id: null,
      time: null,
      temperature: null,
      is_blacklist: false,
    },
    defaultItem: {
      deviceID: null,
      log_id: null,
      time: null,
      temperature: null,
      is_blacklist: false,
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '模擬検温記録を追加' : '模擬検温記録を更新'
      // return 'New Item'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  created () {
    this.getDevices()
    this.initialize()
  },

  methods: {
    // async initialize () {
    //   await this.$axios
    //   .post('/api/get_logs')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.logs = res.data.log_list
    //   })
    //   .catch(err => console.log(err))
    // },

    async initialize () {
      // DataStore Method
      // var init_logs = await DataStore.query(Log)
      // init_logs.forEach(log => this.logs.push(log))
      // console.log(this.logs)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var init_logs_rsp = await API.graphql({ query: listLogs, variables: { filter: filter}})
      var init_logs = init_logs_rsp.data.listLogs.items
      init_logs.forEach(log => this.logs.push(log))
      console.log(this.logs)
    },

    async addLog (item) {
      await this.$axios({
        method: 'post',
        url: '/api/add_log',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    async removeLog (item) {
      await this.$axios({
        method: 'post',
        url: '/api/remove_log',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    // 所属デバイスの選択肢を取得する
    // async getDevices () {
    //   await this.$axios
    //   .post('/api/get_devices_id')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.devices = res.data.devices
    //   })
    //   .catch(err => console.log(err))
    // },

    async getDevices () {
      // DataStore Method
      // var select_devices = await DataStore.query(Device)
      // select_devices.forEach(device => this.devices.push({
      //   id: device.id,
      //   detail: {
      //     device_id: device.device_id,
      //     is_entrance: device.is_entrance,
      //     is_using: device.is_using,
      //   },
      // }))
      // console.log(this.users)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var select_devices_rsp = await API.graphql({query: listDevices, variables: {filter: filter}})
      var select_devices = select_devices_rsp.data.listDevices.items
      select_devices.forEach(device => this.devices.push({
        id: device.id,
        detail: {
          device_id: device.device_id,
          is_entrance: device.is_entrance,
          is_using: device.is_using,
        },
      }))
    },

    // get current time
    getdateTime () {
      var _this = this;
      let yy = new Date().getFullYear()
      // let mm = new Date().getMonth() + 1
      let mm = 
        new Date().getMonth() < 10
          ? "0" + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1
      // let dd = new Date().getDate()
      let dd = 
        new Date().getDate() < 10
          ? "0" + new Date().getDate()
          : new Date().getDate()
      // let hh = new Date().getHours()
      let hh = 
        new Date().getHours() < 10
          ? "0" + new Date().getHours()
          : new Date().getHours()
      let mf =
        new Date().getMinutes() < 10
          ? "0" + new Date().getMinutes()
          : new Date().getMinutes()
      let ss =
        new Date().getSeconds() < 10
          ? "0" + new Date().getSeconds()
          : new Date().getSeconds()
      // let gettime = yy + "-" + mm + "-" + dd + " " + hh + ":" + mf + ":" + ss
      // for AWS Datetime
      let gettime = yy + "-" + mm + "-" + dd + "T" + hh + ":" + mf + ":" + ss + "Z"
      return gettime
    },

    getColor (temperature) {
      if (temperature > 37.5) return 'red'
      else if (temperature > 37.0) return 'orange'
      else return 'green'
    },

    getIconColor (is_blacklist) {
      if (is_blacklist) return 'red'
      else return 'green'
    },

    editItem (item) {
      this.editedIndex = this.logs.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.logs.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    // DELETE
    async deleteItemConfirm () {
      // backend
      // this.removeLog(this.editedItem)

      // backend
      // DataStore Method
      // const targetItem = await DataStore.query(Log, this.logs[this.editedIndex].id)
      // DataStore.delete(targetItem)
      // console.log(`Item【${targetItem.log_id}】deleted.`)

      // backend
      // GraphQL Method
      const deleteItem = {
        id: this.logs[this.editedIndex].id,
        _version: this.logs[this.editedIndex]._version
      }
      const response = await API.graphql({query: deleteLog, variables: {input: deleteItem}})
      var deletedLog = response.data.deleteLog
      console.log(deletedLog)
      console.log(`Item【${this.editedItem.log_id}】deleted.`)

      // frontend
      this.logs.splice(this.editedIndex, 1)
      this.closeDelete()
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save () {
      // UPDATE
      if (this.editedIndex > -1) {
        // Object.assign(this.logs[this.editedIndex], this.editedItem)

        // backend
        // DataStore Method
        // const targetItem = await DataStore.query(Log, this.logs[this.editedIndex].id)
        // var updatedItem = Log.copyOf(targetItem, updated => {
        //   // 不改log_id，因此在修改的UI中也禁用掉了log_id输入框
        //   updated.temperature = Number(this.editedItem.temperature)
        //   updated.time = this.editedItem.time
        //   updated.is_blacklist = this.editedItem.is_blacklist
        //   updated.deviceID = this.editedItem.deviceID
        // })
        // await DataStore.save(updatedItem)
        // console.log(`Item【${targetItem.log_id}】updated.`)

        // backend
        // GraphQL Method
        const updateItem = {
          id: this.logs[this.editedIndex].id,
          _version: this.logs[this.editedIndex]._version,
          temperature: Number(this.editedItem.temperature),
          time: this.editedItem.time,
          is_blacklist: this.editedItem.is_blacklist,
          deviceID: this.editedItem.deviceID
        }
        const response = await API.graphql({query: updateLog, variables: {input: updateItem}})
        var updatedLog = response.data.updateLog
        console.log(updatedLog)
        console.log(`Item【${this.editedItem.log_id}】updated.`)

        // frontend
        // this.logs.splice(this.editedIndex, 1, updatedItem)
        this.logs.splice(this.editedIndex, 1, updatedLog)

      // CREATE
      } else {
        // backend
        // DataStore Method
        // const createdItem = await DataStore.save(
        //   // new Log(this.editedItem)
        //   new Log({
        //     "log_id": this.editedItem.log_id,
        //     "temperature": Number(this.editedItem.temperature),
        //     "time": this.editedItem.time,
        //     "is_blacklist": this.editedItem.is_blacklist,
        //     "deviceID": this.editedItem.deviceID,
        //   })
        // )
        // console.log(`Item【${this.editedItem.log_id}】created.`)
        // // console.log(`createdItem_id = ${createdItem.id}`)


        // backend
        // GraphQL Method
        const createItem = {
          log_id: this.editedItem.log_id,
          temperature: Number(this.editedItem.temperature),
          time: this.editedItem.time,
          is_blacklist: this.editedItem.is_blacklist,
          deviceID: this.editedItem.deviceID
        };
        const response = await API.graphql({query: createLog, variables: {input: createItem}})
        var createdLog = response.data.createLog
        console.log(createdLog)
        console.log(`Item【${this.editedItem.log_id}】created.`)


        // frontend
        // this.logs.push(createdItem)
        this.logs.push(createdLog)
        console.log(this.logs)
        // this.logs.push(this.editedItem)
      }
      // デバイスの追加
      // this.addLog(this.editedItem)
      this.close()
    },

    // find specific item in object array
    showDetailByID (id) {
      let obj = this.devices.find(o => o.id === id)
      if (obj !== undefined) {
        return `${ obj.detail.device_id }`
        // return `${ obj.detail.device_id } (${ obj.detail.is_entrance }, ${ obj.detail.is_using })`
      } else {
        return ''
      }
    },
  },
}
</script>