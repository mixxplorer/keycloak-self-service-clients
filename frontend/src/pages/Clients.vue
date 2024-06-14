<template>
  <q-page>
    <div class="page-content">
      <h1>Clients</h1>
      <q-table
        flat
        bordered
        title="Your Clients"
        :rows="rows"
        :columns="columns"
        row-key="clientId"
        :filter="filter"
        :loading="loading"
        hide-pagination
        :rows-per-page-options="[0]"
      >
        <template v-slot:top-right>
          <q-input
            v-model="filter"
            borderless
            dense
            debounce="300"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div>
              <q-btn
                color="primary"
                flat
                type="a"
                :to="{
                  name: 'ClientOverview',
                  params: { clientUuid: props.value },
                }"
              >
                View
              </q-btn>
              <q-btn
                color="primary"
                flat
                type="a"
                :to="{
                  name: 'ClientEdit',
                  params: { clientUuid: props.value },
                }"
              >
                Edit
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar'
import { Ref, ref } from 'vue'

import { IClient } from 'src/definitions/Client'
import { KeycloakRequestAPI } from 'src/requestAPI/KeycloakRequestAPI'

defineOptions({
  name: 'ClientsList',
})

const loading = ref(true)

const filter = ref('')

const columns: QTableColumn[] = [
  {
    name: 'clientId',
    label: 'Client ID',
    field: 'clientId',
    sortable: true,
    align: 'left',
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'enabled',
    label: 'Enabled',
    field: 'enabled',
    sortable: true,
    format: (val: boolean) => (val ? 'yes' : 'no'),
    align: 'left',
  },

  {
    name: 'actions',
    label: 'Actions',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    field: (row: IClient) => row.id,
    align: 'center',
  },
]

const rows: Ref<IClient[]> = ref([])

async function loadClients() {
  const resp = await KeycloakRequestAPI.clientsGet()
  rows.value = resp.data
  loading.value = false
}
loadClients()
</script>
