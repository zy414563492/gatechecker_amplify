<template>
  <v-app>
    
    <link-bar :subLink="name"/>

    <v-data-table
      :headers="headers"
      :items="devices"
      class="elevation-1"
    >
      <template v-slot:[`item.gateID`]="{ item }">
        {{ showDetailByID(item.gateID) }}
      </template>

      <template v-slot:[`item.is_entrance`]="{ item }">
        {{ item.is_entrance ? '入口' : '出口'}}
      </template>

      <template v-slot:[`item.is_using`]="{ item }">
        <v-chip
          :color="getColor(item.is_using)"
          dark
        >
          {{ item.is_using ? '使用中' : '一時停止' }}
        </v-chip>
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
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                デバイスを追加
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
                      <v-text-field
                        v-model="editedItem.device_id"
                        label="デバイスID"
                        outlined
                        :disabled="editedIndex !== -1"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        v-model="editedItem.is_entrance"
                        :items="direction"
                        item-text="state_name"
                        item-value="state"
                        label="向き"
                        outlined
                      ></v-select>

                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        v-model="editedItem.is_using"
                        :items="device_state"
                        item-text="state_name"
                        item-value="state"
                        label="状態"
                        outlined
                      ></v-select>

                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="editedItem.last_alert_time"
                        label="最近のアラート時間"
                        outlined
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        v-model="editedItem.gateID"
                        :items="gates"
                        item-text="detail"
                        item-value="id"
                        label="所属ゲート"
                        outlined
                      >
                        <template slot="selection" slot-scope='{ item }'>
                          {{ `${ item.detail.gate_id } - ${ item.detail.name }` }}
                        </template>
                        <template slot="item" slot-scope='{ item }'>
                          {{ `${ item.detail.gate_id } - ${ item.detail.name }` }}
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
          @click="resetItem(item)"
        >
          mdi-autorenew
        </v-icon>
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
// import { Gate, Device } from '@/models'
import { API, graphqlOperation } from 'aws-amplify'
import { listDevices, listGates } from '../graphql/queries'
import { createDevice, updateDevice, deleteDevice } from '../graphql/mutations'


export default {
  data: () => ({
    name: 'デバイス',
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'デバイスID', value: 'device_id' },
      { text: '向き', value: 'is_entrance' },
      { text: '状態', value: 'is_using' },
      { text: '最近のアラート時間', value: 'last_alert_time' },
      { text: '所属ゲート', value: 'gateID' },
      { text: '操作', value: 'actions', sortable: false },
    ],
    gates: [],
    // gates中元素构造如下
    // gate: {
    //   id: null,
    //   detail: {
    //     gate_id: null,
    //     name: null,
    //   },
    // },
    devices: [],
    direction: [
      { state: true, state_name:'入口' },
      { state: false, state_name:'出口' }
    ],
    device_state: [
      { state: true, state_name:'使用中' },
      { state: false, state_name:'一時停止' }
    ],
    editedIndex: -1,
    editedItem: {
      device_id: null,
      is_entrance: true,
      is_using: true,
      last_alert_time: null,
      gateID: null,
    },
    defaultItem: {
      device_id: null,
      is_entrance: true,
      is_using: true,
      last_alert_time: null,
      gateID: null,
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'デバイスを追加' : 'デバイスを更新'
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
    this.getGates()
    this.initialize()
  },

  methods: {
    // async initialize () {
    //   await this.$axios
    //   .post('/api/get_devices')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.devices = res.data.device_list
    //   })
    //   .catch(err => console.log(err))
    // },

    // get current time
    getCurrentTime() {
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

    async initialize () {
      // DataStore Method
      // var init_devices = await DataStore.query(Device)
      // init_devices.forEach(device => this.devices.push(device))
      // console.log(this.devices)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var init_devices_rsp = await API.graphql({ query: listDevices, variables: { filter: filter}})
      var init_devices = init_devices_rsp.data.listDevices.items
      init_devices.forEach(device => this.devices.push(device))
      console.log(this.devices)

    },

    async addDevice (item) {
      await this.$axios({
        method: 'post',
        url: '/api/add_device',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    async removeDevice (item) {
      await this.$axios({
        method: 'post',
        url: '/api/remove_device',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    // 所属ゲートの選択肢を取得する
    // async getGates () {
    //   await this.$axios
    //   .post('/api/get_gates_id')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.gates = res.data.gates
    //   })
    //   .catch(err => console.log(err))
    // },
    
    async getGates () {
      // DataStore Method
      // var select_gates = await DataStore.query(Gate)
      // select_gates.forEach(gate => this.gates.push({
      //   id: gate.id,
      //   detail: {
      //     gate_id: gate.gate_id,
      //     name: gate.name,
      //   },
      // }))
      // console.log(this.users)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var select_gates_rsp = await API.graphql({query: listGates, variables: {filter: filter}})
      var select_gates = select_gates_rsp.data.listGates.items
      select_gates.forEach(gate => this.gates.push({
        id: gate.id,
        detail: {
          gate_id: gate.gate_id,
          name: gate.name,
        },
      }))
    },

    getColor (gate_state) {
      if (gate_state) return 'green'
      else return 'red'
    },

    editItem (item) {
      this.editedIndex = this.devices.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.devices.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async resetItem (item) {
      var resetItem = Object.assign({}, item)

      // backend
      const updateItem = {
        id: resetItem.id,
        _version: resetItem._version,
        last_reset_time: this.getCurrentTime()
      }
      const response = await API.graphql({query: updateDevice, variables: {input: updateItem}})
      var updatedDevice = response.data.updateDevice
      console.log(updatedDevice)
      console.log(`Item【${resetItem.device_id}】resetted.`)
    },

    // DELETE
    async deleteItemConfirm () {
      // backend
      // this.removeDevice(this.editedItem)

      // backend
      // DataStore Method
      // const targetItem = await DataStore.query(Device, this.devices[this.editedIndex].id)
      // DataStore.delete(targetItem)
      // console.log(`Item【${targetItem.device_id}】deleted.`)

      // backend
      // GraphQL Method
      const deleteItem = {
        id: this.devices[this.editedIndex].id,
        _version: this.devices[this.editedIndex]._version
      }
      const response = await API.graphql({query: deleteDevice, variables: {input: deleteItem}})
      var deletedDevice = response.data.deleteDevice
      console.log(deletedDevice)
      console.log(`Item【${this.editedItem.device_id}】deleted.`)

      // frontend
      this.devices.splice(this.editedIndex, 1)
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
        // Object.assign(this.devices[this.editedIndex], this.editedItem)

        // backend
        // DataStore Method
        // const targetItem = await DataStore.query(Device, this.devices[this.editedIndex].id)

        // var updatedItem = Device.copyOf(targetItem, updated => {
        //   // 不改device_id，因此在修改的UI中也禁用掉了device_id输入框
        //   updated.is_entrance = this.editedItem.is_entrance
        //   updated.is_using = this.editedItem.is_using
        //   updated.last_alert_time = this.editedItem.last_alert_time
        //   updated.gateID = this.editedItem.gateID
        // })

        // await DataStore.save(updatedItem)
        // console.log(`Item【${targetItem.device_id}】updated.`)

        // backend
        // GraphQL Method
        console.log(this.devices[this.editedIndex].id)
        const updateItem = {
          id: this.devices[this.editedIndex].id,
          _version: this.devices[this.editedIndex]._version,
          device_id: this.editedItem.device_id,
          is_entrance: this.editedItem.is_entrance,
          is_using: this.editedItem.is_using,
          last_alert_time: this.editedItem.last_alert_time,
          gateID: this.editedItem.gateID
        }
        const response = await API.graphql({query: updateDevice, variables: {input: updateItem}})
        var updatedDevice = response.data.updateDevice
        console.log(updatedDevice)
        console.log(`Item【${this.editedItem.device_id}】updated.`)

        // frontend
        // this.devices.splice(this.editedIndex, 1, updatedItem)
        this.devices.splice(this.editedIndex, 1, updatedDevice)

      // CREATE
      } else {
        // backend
        // DataStore Method
        // const createdItem = await DataStore.save(
        //   new Device(this.editedItem)
        // )
        // console.log(`Item【${this.editedItem.device_id}】created.`)

        // backend
        // GraphQL Method
        const createItem = {
          id: this.editedItem.device_id,
          device_id: this.editedItem.device_id,
          is_entrance: this.editedItem.is_entrance,
          is_using: this.editedItem.is_using,
          last_alert_time: this.editedItem.last_alert_time,
          last_reset_time: "2010-01-01T00:00:00Z",
          gateID: this.editedItem.gateID
        };
        const response = await API.graphql({ query: createDevice, variables: {input: createItem}})
        var createdDevice = response.data.createDevice
        console.log(createdDevice)
        console.log(`Item【${this.editedItem.device_id}】created.`)

        // frontend
        // this.devices.push(createdItem)
        this.devices.push(createdDevice)
        console.log(this.devices)
        // this.devices.push(this.editedItem)
      }
      // デバイスの追加
      // this.addDevice(this.editedItem)
      this.close()
    },

    // find specific item in object array
    showDetailByID (id) {
      let obj = this.gates.find(o => o.id === id)
      if (obj !== undefined) {
        return `${ obj.detail.gate_id } - ${ obj.detail.name }`
      } else {
        return ''
      }
    },
  },
}
</script>