<template>
  <v-app>
    
    <link-bar :subLink="name"/>

    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-1"
    >
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
                エンドユーザーを追加
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
                        v-model="editedItem.user_id"
                        label="ユーザーID"
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
import { DataStore } from '@aws-amplify/datastore'
import { User } from '@/models'

import { API, graphqlOperation } from 'aws-amplify'
import { listUsers } from '../graphql/queries'
import { createUser, updateUser, deleteUser } from '../graphql/mutations'


export default {
  data: () => ({
    name: 'エンドユーザー',
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'ユーザーID', value: 'user_id' },
      { text: '名称', value: 'name' },
      { text: '操作', value: 'actions', sortable: false },
    ],
    users: [],
    editedIndex: -1,
    editedItem: {
      user_id: null,
      name: null,
    },
    defaultItem: {
      user_id: null,
      name: null,
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'エンドユーザーを追加' : 'エンドユーザーを更新'
    }
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
    this.initialize()
  },

  methods: {
    // async initialize () {
    //   await this.$axios
    //   .post('/api/get_users')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.users = res.data.user_list
    //   })
    //   .catch(err => console.log(err))
    // },

    async initialize () {
      // DataStore Method
      // var init_users = await DataStore.query(User)
      // init_users.forEach(user => this.users.push(user))
      // console.log(this.users)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var init_users_rsp = await API.graphql({ query: listUsers, variables: { filter: filter}})
      var init_users = init_users_rsp.data.listUsers.items
      init_users.forEach(user => this.users.push(user))
      console.log(this.users)
    },

    async addUser (item) {
      await this.$axios({
        method: 'post',
        url: '/api/add_user',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    async removeUser (item) {
      await this.$axios({
        method: 'post',
        url: '/api/remove_user',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    editItem (item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    // DELETE
    async deleteItemConfirm () {
      // backend
      // this.removeUser(this.editedItem)

      // backend
      // DataStore Method
      // const targetItem = await DataStore.query(User, this.users[this.editedIndex].id)
      // DataStore.delete(targetItem)
      // console.log(`Item【${targetItem.user_id}】deleted.`)

      // backend
      // GraphQL Method
      const deleteItem = {
        id: this.users[this.editedIndex].id,
        _version: this.users[this.editedIndex]._version
      }
      const response = await API.graphql({ query: deleteUser, variables: {input: deleteItem}})
      var deletedUser = response.data.deleteUser
      console.log(deletedUser)
      console.log(`Item【${this.editedItem.user_id}】deleted.`)

      // frontend
      this.users.splice(this.editedIndex, 1)
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
        // backend
        // DataStore Method
        // const targetItem = await DataStore.query(User, this.users[this.editedIndex].id)

        // var updatedItem = User.copyOf(targetItem, updated => {
        //   // 不改user_id只改name，因此在修改的UI中也禁用掉了user_id输入框
        //   updated.name = this.editedItem.name
        // })

        // await DataStore.save(updatedItem)
        // console.log(`Item【${targetItem.user_id}】updated.`)


        // backend
        // GraphQL Method
        console.log(this.users[this.editedIndex].id)
        const updateItem = {
          id: this.users[this.editedIndex].id,
          _version: this.users[this.editedIndex]._version,
          user_id: this.editedItem.user_id,
          name: this.editedItem.name
        }
        const response = await API.graphql({ query: updateUser, variables: {input: updateItem}})
        var updatedUser = response.data.updateUser
        console.log(updatedUser)
        console.log(`Item【${this.editedItem.user_id}】updated.`)

        // frontend
        // this.users.splice(this.editedIndex, 1, updatedItem)
        this.users.splice(this.editedIndex, 1, updatedUser)

      // CREATE
      } else {
        // backend
        // DataStore Method
        // const createdItem = await DataStore.save(
        //   new User(this.editedItem)
        //   // new User({
        //   //   "user_id": this.editedItem.user_id,
        //   //   "name": this.editedItem.name
        //   // })
        // )
        // console.log(`Item【${this.editedItem.user_id}】created.`)

        // backend
        // GraphQL Method
        const createItem = {
          user_id: this.editedItem.user_id,
          name: this.editedItem.name
        };
        const response = await API.graphql({query: createUser, variables: {input: createItem}})
        var createdUser = response.data.createUser
        console.log(createdUser)
        console.log(`Item【${this.editedItem.user_id}】created.`)

        // frontend
        // this.users.push(createdItem)
        this.users.push(createdUser)
        console.log(this.users)
        // this.users.push(this.editedItem)
      }

      // エンドユーザーの追加
      // this.addUser(this.editedItem)
      this.close()
    },
  },
}
</script>