<template>
  <v-app>
    
    <link-bar :subLink="name"/>

    <v-data-table
      :headers="headers"
      :items="count_info"
      item-key="name"
      group-by="to_user"
      class="elevation-1"
    >
      <template v-slot:[`group.header`]="{ group, headers }">
        <td>{{ "エンドユーザー：" + group }}</td>
        <td :colspan="headers.length-1"></td>
      </template>

      <template v-slot:[`item.has_blacklist`]="{ item }">
        <v-icon
          :color="getIconColor(item.has_blacklist)"
          class="mr-2"
        >
          {{ item.has_blacklist ? "mdi-alert-decagram" : "mdi-check-circle-outline"}}
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
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <!-- ブラックリスト検出した場合のみアラーム解除できる -->
        <v-icon
          :disabled="!item.has_blacklist"
          :color="item.has_blacklist ? '#0277BD' : ''"
          @click="deleteItem(item)"
        >
          mdi-timer-off-outline
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
import { API, graphqlOperation } from 'aws-amplify'
import { countInfo } from '../graphql/queries'
import { clearAlarm } from '../graphql/mutations'


const ListTodosQuery = `
query searchUsers {
  listUsers(filter: {_deleted: {ne: true}}) {
    items {
      name
      Buildings(filter: {_deleted: {ne: true}}) {
        items {
          name
          building_id
          Gates(filter: {_deleted: {ne: true}, is_open: {eq: true}}) {
            items {
              Devices(filter: {_deleted: {ne: true}, is_using: {eq: true}}) {
                items {
                  Logs(filter: {_deleted: {ne: true}}) {
                    items {
                      log_id
                      time
                      temperature
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export default {
  data: () => ({
    name: '全体確認',
    dialogDelete: false,

    headers: [
      { text: '施設', value: 'name'},
      { text: 'エンドユーザー', value: 'to_user'},
      { text: '累計入場者数', value: 'count_enter'},
      { text: '累計退場者数', value: 'count_exit'},
      { text: '今施設内にいる人数', value: 'count_inside'},
      { text: 'ブラックリスト検出', value: 'has_blacklist'},
      { text: '操作', value: 'actions', sortable: false },
    ],
    count_info: [],
    editedIndex: -1,
    editedItem: {
      name: null,
      to_user: null,
      count_enter: null,
      count_exit: null,
      count_inside: null,
      has_blacklist: null,
    },
    defaultItem: {
      name: null,
      to_user: null,
      count_enter: null,
      count_exit: null,
      count_inside: null,
      has_blacklist: null,
    },
    
  }),

  computed: {
    // formTitle () {
    //   return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    // },
  },

  created () {
    this.initialize()
  },

  methods: {
    // async initialize () {
    //   await this.$axios
    //   .post('/api/get_count')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.count_info = res.data.count_info
    //   })
    //   .catch(err => console.log(err))
    // },

    async initialize () {
      // const todos = await API.graphql(graphqlOperation(listBuildings))
      // console.log(todos)

      // const todos2 = await API.graphql(graphqlOperation(ListTodosQuery))
      // console.log(todos2)

      const response = await API.graphql(graphqlOperation(countInfo))
      const response_obj = JSON.parse(response.data.countInfo)
      console.log(response_obj.count_info)
      this.count_info = response_obj.count_info
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
      // this.count_info.forEach(i => {
      //   console.log(i.id)
      // })
      console.log(item)

      const response = await API.graphql(graphqlOperation(clearAlarm, { building_id: item }))
      // const response_obj = JSON.parse(response)
      console.log(response.data)

      // var select_gates = await DataStore.query(Gate)

      // select_gates.forEach(gate => this.gates.push({
      //   id: gate.id,
      //   detail: {
      //     gate_id: gate.gate_id,
      //     name: gate.name,
      //   },
      // }))
      // console.log(this.users)
    },

    getIconColor (has_blacklist) {
      if (has_blacklist) return 'red'
      else return 'green'
    },

    deleteItem (item) {
      this.editedIndex = this.count_info.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      // 找到该设施的所有device，更新最近警报时间
      // this.clearAlarm({"building_name": this.count_info[this.editedIndex].name})
      this.clearAlarm(this.count_info[this.editedIndex].id)

      // clear alarm in frontend table
      this.count_info[this.editedIndex].has_blacklist = false
      this.closeDelete()
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
  },
}
</script>