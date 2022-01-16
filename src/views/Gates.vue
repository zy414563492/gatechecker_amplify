<template>
  <v-app>
    
    <link-bar :subLink="name"/>

    <v-data-table
      :headers="headers"
      :items="gates"
      class="elevation-1"
    >
      <template v-slot:[`item.buildingID`]="{ item }">
        {{ showDetailByID(item.buildingID) }}
      </template>

      <template v-slot:[`item.is_open`]="{ item }">
        <v-chip
          :color="getColor(item.is_open)"
          dark
        >
          {{ item.is_open ? 'Opening' : 'Closed'}}
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
                ゲートを追加
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
                        v-model="editedItem.gate_id"
                        label="ゲートID"
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
                      <v-select
                        v-model="editedItem.is_open"
                        :items="gate_state"
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
                      <v-select
                        v-model="editedItem.buildingID"
                        :items="buildings"
                        item-text="detail"
                        item-value="id"
                        label="所属施設"
                        outlined
                      >
                        <template slot="selection" slot-scope='{ item }'>
                          {{ `${ item.detail.building_id } - ${ item.detail.name }` }}
                        </template>
                        <template slot="item" slot-scope='{ item }'>
                          {{ `${ item.detail.building_id } - ${ item.detail.name }` }}
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
// import { Building, Gate } from '@/models'
import { API, graphqlOperation } from 'aws-amplify'
import { listGates, listBuildings } from '../graphql/queries'
import { createGate, updateGate, deleteGate } from '../graphql/mutations'


export default {
  data: () => ({
    name: 'ゲート',
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'ゲートID', value: 'gate_id' },
      { text: '名称', value: 'name' },
      { text: '状態', value: 'is_open' },
      { text: '所属施設', value: 'buildingID' },
      { text: '操作', value: 'actions', sortable: false },
    ],
    buildings: [],
    // buildings中元素构造如下
    // building: {
    //   id: null,
    //   detail: {
    //     building_id: null,
    //     name: null,
    //   },
    // },
    gates: [],
    gate_state: [
      { state: true, state_name:'Opening' },
      { state: false, state_name:'Closed' }
    ],
    editedIndex: -1,
    editedItem: {
      _version: null,
      gate_id: null,
      name: null,
      is_open: true,
      buildingID: null,
    },
    defaultItem: {
      _version: null,
      gate_id: null,
      name: null,
      is_open: true,
      buildingID: null,
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'ゲートを追加' : 'ゲートを更新'
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
    this.getBuildings()
    this.initialize()
  },

  methods: {
    // async initialize () {
    //   await this.$axios
    //   .post('/api/get_gates')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.gates = res.data.gate_list
    //   })
    //   .catch(err => console.log(err))
    // },

    async initialize () {
      // DataStore Method
      // var init_gates = await DataStore.query(Gate)
      // init_gates.forEach(gate => this.gates.push(gate))
      // console.log(this.gates)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var init_gates_rsp = await API.graphql({ query: listGates, variables: { filter: filter}})
      var init_gates = init_gates_rsp.data.listGates.items
      init_gates.forEach(gate => this.gates.push(gate))
      console.log(this.gates)
    },

    async addGate (item) {
      await this.$axios({
        method: 'post',
        url: '/api/add_gate',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    async removeGate (item) {
      await this.$axios({
        method: 'post',
        url: '/api/remove_gate',
        withCredentials: true,
        data: JSON.stringify(item)
      }).then((res) => {
        console.log(res)
      })
    },

    // 所属施設の選択肢を取得する
    // async getBuildings () {
    //   await this.$axios
    //   .post('/api/get_buildings_id')
    //   .then((res) => {
    //     console.log(res.data)
    //     this.buildings = res.data.buildings
    //   })
    //   .catch(err => console.log(err))
    // },

    async getBuildings () {
      // DataStore Method
      // var select_buildings = await DataStore.query(Building)
      // select_buildings.forEach(building => this.buildings.push({
      //   id: building.id,
      //   detail: {
      //     building_id: building.building_id,
      //     name: building.name,
      //   },
      // }))
      // console.log(this.users)

      // GraphQL Method
      let filter = {
        _deleted: {
          ne: true // _deleted priority != true
        }
      }
      var select_buildings_rsp = await API.graphql({query: listBuildings, variables: {filter: filter}})
      var select_buildings = select_buildings_rsp.data.listBuildings.items
      select_buildings.forEach(building => this.buildings.push({
        id: building.id,
        detail: {
          building_id: building.building_id,
          name: building.name,
        },
      }))
    },

    getColor (gate_state) {
      if (gate_state) return 'green'
      else return 'red'
    },

    editItem (item) {
      this.editedIndex = this.gates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.gates.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    // DELETE
    async deleteItemConfirm () {
      // backend
      // this.removeGate(this.editedItem)

      // backend
      // DataStore Method
      // const targetItem = await DataStore.query(Gate, this.gates[this.editedIndex].id)
      // DataStore.delete(targetItem)
      // console.log(`Item【${targetItem.gate_id}】deleted.`)

      // backend
      // GraphQL Method
      const deleteItem = {
        id: this.gates[this.editedIndex].id,
        _version: this.gates[this.editedIndex]._version
      }
      const response = await API.graphql({query: deleteGate, variables: {input: deleteItem}})
      var deletedGate = response.data.deleteGate
      console.log(deletedGate)
      console.log(`Item【${this.editedItem.gate_id}】deleted.`)

      // frontend
      this.gates.splice(this.editedIndex, 1)
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
        // Object.assign(this.gates[this.editedIndex], this.editedItem)

        // backend
        // DataStore Method
        // const targetItem = await DataStore.query(Gate, this.gates[this.editedIndex].id)

        // var updatedItem = Gate.copyOf(targetItem, updated => {
        //   // 不改gate_id，因此在修改的UI中也禁用掉了gate_id输入框
        //   updated.name = this.editedItem.name
        //   updated.is_open = this.editedItem.is_open
        //   updated.buildingID = this.editedItem.buildingID
        // })

        // await DataStore.save(updatedItem)
        // console.log(`Item【${targetItem.gate_id}】updated.`)


        // backend
        // GraphQL Method
        console.log(this.gates[this.editedIndex].id)
        const updateItem = {
          id: this.gates[this.editedIndex].id,
          _version: this.gates[this.editedIndex]._version,
          gate_id: this.editedItem.gate_id,
          name: this.editedItem.name,
          is_open: this.editedItem.is_open,
          buildingID: this.editedItem.buildingID
        }
        const response = await API.graphql({query: updateGate, variables: {input: updateItem}})
        var updatedGate = response.data.updateGate
        console.log(updatedGate)
        console.log(`Item【${this.editedItem.gate_id}】updated.`)

        // frontend
        // this.gates.splice(this.editedIndex, 1, updatedItem)
        this.gates.splice(this.editedIndex, 1, updatedGate)

      // CREATE
      } else {
        // backend
        // DataStore Method
        // const createdItem = await DataStore.save(
        //   new Gate(this.editedItem)
        // )
        // console.log(`Item【${this.editedItem.gate_id}】created.`)

        // backend
        // GraphQL Method
        const createItem = {
          gate_id: this.editedItem.gate_id,
          name: this.editedItem.name,
          is_open: this.editedItem.is_open,
          buildingID: this.editedItem.buildingID
        };
        const response = await API.graphql({query: createGate, variables: {input: createItem}})
        var createdGate = response.data.createGate
        console.log(createdGate)
        console.log(`Item【${this.editedItem.gate_id}】created.`)

        // frontend
        // this.gates.push(createdItem)
        this.gates.push(createdGate)
        console.log(this.gates)
        // this.gates.push(this.editedItem)
      }
      // ゲートの追加
      // this.addGate(this.editedItem)
      this.close()
    },

    // find specific item in object array
    showDetailByID (id) {
      let obj = this.buildings.find(o => o.id === id)
      if (obj !== undefined) {
        return `${ obj.detail.building_id } - ${ obj.detail.name }`
      } else {
        return ''
      }
    },
  },
}
</script>