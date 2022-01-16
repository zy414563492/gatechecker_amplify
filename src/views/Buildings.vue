<template>
  <v-app>
    
    <link-bar :subLink="name"/>

    <v-data-table
      :headers="headers"
      :items="buildings"
      class="elevation-1"
    >
      <template v-slot:[`item.userID`]="{ item }">
        {{ showDetailByID(item.userID) }}
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
                施設を追加
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
                        v-model="editedItem.building_id"
                        label="施設ID"
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
                        v-model="editedItem.name"
                        label="名称"
                        outlined
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-text-field
                        v-model="editedItem.location"
                        label="アドレス"
                        outlined
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <v-select
                        v-model="editedItem.userID"
                        :items="users"
                        item-text="detail"
                        item-value="id"
                        label="所属ユーザー"
                        outlined
                      >
                        <template slot="selection" slot-scope='{ item }'>
                          {{ `${ item.detail.user_id } - ${ item.detail.name }` }}
                        </template>
                        <template slot="item" slot-scope='{ item }'>
                          {{ `${ item.detail.user_id } - ${ item.detail.name }` }}
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
// import { User, Building } from '@/models'
import { API, graphqlOperation } from 'aws-amplify'
import { listBuildings, listUsers } from '../graphql/queries'
import { createBuilding, updateBuilding, deleteBuilding } from '../graphql/mutations'

export default {
  data: () => ({
    name: '施設',
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: '施設ID', value: 'building_id' },
      { text: '名称', value: 'name' },
      { text: 'アドレス', value: 'location' },
      { text: '所属ユーザー', value: 'userID' },
      { text: '操作', value: 'actions', sortable: false },
    ],
    users: [],
    // users中元素构造如下
    // user: {
    //   id: null,
    //   detail: {
    //     user_id: null,
    //     name: null,
    //   },
    // },
    buildings: [],
    editedIndex: -1,
    editedItem: {
      building_id: null,
      name: null,
      location: null,
      userID: null,
    },
    defaultItem: {
      building_id: null,
      name: null,
      location: null,
      userID: null,
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '施設を追加' : '施設を更新'
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
    this.getUsers()
    this.initialize()
  },

  methods: {
    // async initialize () {
    //   await this.$axios
    //   .post('/api/get_buildings')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.buildings = res.data.building_list
    //   })
    //   .catch(err => console.log(err))
    // },

    async initialize () {
      // DataStore Method
      // var init_buildings = await DataStore.query(Building)
      // init_buildings.forEach(building => this.buildings.push(building))
      // console.log(this.buildings)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var init_buildings_rsp = await API.graphql({ query: listBuildings, variables: { filter: filter}})
      var init_buildings = init_buildings_rsp.data.listBuildings.items
      init_buildings.forEach(building => this.buildings.push(building))
      console.log(this.buildings)
    },

    async addBuilding (item) {
      await this.$axios({
        method: 'post',
        url: '/api/add_building',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    async removeBuilding (item) {
      await this.$axios({
        method: 'post',
        url: '/api/remove_building',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    // 所属ユーザーの選択肢を取得する
    // async getUsers () {
    //   await this.$axios
    //   .post('/api/get_users_id')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.users = res.data.users
    //   })
    //   .catch(err => console.log(err))
    // },

    async getUsers () {
      // DataStore Method
      // var select_users = await DataStore.query(User)
      // select_users.forEach(user => this.users.push({
      //   id: user.id,
      //   detail: {
      //     user_id: user.user_id,
      //     name: user.name,
      //   },
      // }))
      // console.log(this.users)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var select_users_rsp = await API.graphql({query: listUsers, variables: { filter: filter}})
      var select_users = select_users_rsp.data.listUsers.items
      select_users.forEach(user => this.users.push({
        id: user.id,
        detail: {
          user_id: user.user_id,
          name: user.name,
        },
      }))
    },

    editItem (item) {
      this.editedIndex = this.buildings.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.buildings.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    // DELETE
    async deleteItemConfirm () {
      // backend
      // this.removeBuilding(this.editedItem)

      // backend
      // DataStore Method
      // const targetItem = await DataStore.query(Building, this.buildings[this.editedIndex].id)
      // DataStore.delete(targetItem)
      // console.log(`Item【${targetItem.building_id}】deleted.`)

      // backend
      // GraphQL Method
      const deleteItem = {
        id: this.buildings[this.editedIndex].id,
        _version: this.buildings[this.editedIndex]._version
      }
      const response = await API.graphql({query: deleteBuilding, variables: {input: deleteItem}})
      var deletedBuilding = response.data.deleteBuilding
      console.log(deletedBuilding)
      console.log(`Item【${this.editedItem.building_id}】deleted.`)

      // frontend
      this.buildings.splice(this.editedIndex, 1)
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
        // Object.assign(this.buildings[this.editedIndex], this.editedItem)

        // backend
        // DataStore Method
        // const targetItem = await DataStore.query(Building, this.buildings[this.editedIndex].id)

        // var updatedItem = Building.copyOf(targetItem, updated => {
        //   // 不改building_id，因此在修改的UI中也禁用掉了building_id输入框
        //   updated.name = this.editedItem.name
        //   updated.location = this.editedItem.location
        //   updated.userID = this.editedItem.userID
        // })

        // await DataStore.save(updatedItem)
        // console.log(`Item【${targetItem.building_id}】updated.`)


        // backend
        // GraphQL Method
        console.log(this.buildings[this.editedIndex].id)
        const updateItem = {
          id: this.buildings[this.editedIndex].id,
          _version: this.buildings[this.editedIndex]._version,
          building_id: this.editedItem.building_id,
          name: this.editedItem.name,
          location: this.editedItem.location,
          userID: this.editedItem.userID
        }
        const response = await API.graphql({query: updateBuilding, variables: {input: updateItem}})
        var updatedBuilding = response.data.updateBuilding
        console.log(updatedBuilding)
        console.log(`Item【${this.editedItem.building_id}】updated.`)

        // frontend
        // this.buildings.splice(this.editedIndex, 1, updatedItem)
        this.buildings.splice(this.editedIndex, 1, updatedBuilding)

      // CREATE
      } else {
        // backend
        // DataStore Method
        // const createdItem = await DataStore.save(
        //   new Building(this.editedItem)
        // )
        // console.log(`Item【${this.editedItem.building_id}】created.`)

        // backend
        // GraphQL Method
        const createItem = {
          building_id: this.editedItem.building_id,
          name: this.editedItem.name,
          location: this.editedItem.location,
          userID: this.editedItem.userID
        };
        const response = await API.graphql({query: createBuilding, variables: {input: createItem}})
        var createdBuilding = response.data.createBuilding
        console.log(createdBuilding)
        console.log(`Item【${this.editedItem.building_id}】created.`)

        // frontend
        // this.buildings.push(createdItem)
        this.buildings.push(createdBuilding)
        console.log(this.buildings)
        // this.buildings.push(this.editedItem)
      }
      // エンドユーザーの追加
      // this.addBuilding(this.editedItem)
      this.close()
    },

    // find specific item in object array
    showDetailByID (id) {
      let obj = this.users.find(o => o.id === id)
      if (obj !== undefined) {
        return `${ obj.detail.user_id } - ${ obj.detail.name }`
      } else {
        return ''
      }
    },
  },
}
</script>