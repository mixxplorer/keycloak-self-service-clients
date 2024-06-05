<template>
  <q-page>
    <div class="page-content">
      <h1 v-if="isEditForm">Edit Client</h1>
      <h1 v-else>Add New Client</h1>

      <div v-if="loading" class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="50px" />
      </div>
      <q-form v-else class="q-gutter-md" @submit="saveClient">
        <h2>Metadata</h2>
        <q-input
          v-model="client.clientId"
          filled
          label="Client ID"
          :hint="isEditForm ? 'You cannot change the client ID.' : 'A unique (OIDC) client ID.'"
          lazy-rules
          :rules="[
            (val) => (val && val.length >= 10) || 'Please type at least 10 chars',
            (val: string) => val.startsWith('ssc-') || 'Your client ID must start with \'ssc-\''
          ]"
          :readonly="isEditForm"
        >
          <template v-slot:append>
            <a title="Copy client ID to clipboard">
              <q-icon
                name="file_copy"
                class="cursor-pointer"
                @click="copyToClipboard(client.clientId)"
              />
            </a>
          </template>
        </q-input>

        <q-item class="form-toggle-item" tag="label">
          <q-item-section avatar>
            <q-toggle v-model="client.enabled" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Enable Client</q-item-label>
            <q-item-label caption>
              Disabled Client will not perform any authentication.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="form-toggle-item" tag="label">
          <q-item-section avatar>
            <q-toggle v-model="client.publicClient" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Public Client</q-item-label>
            <q-item-label caption>
              If you cannot share a secret in a secure manner (like with a Singe
              Page App) you can opt for a public client, which does not require
              a client secret. For non-public clients, you can obtain the secret
              on the setup instructions page.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-input
          v-model="client.name"
          filled
          label="Client name"
          hint="This is the name users will see in their account console."
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          v-model="client.description"
          filled
          label="Client description"
          hint="A description users will see in their account console."
          type="textarea"
        />

        <h2 class="q-mt-xl">URIs</h2>

        <q-input
          v-model="client.rootUrl"
          filled
          type="url"
          label="Root URL"
          hint="The main URL of the application you would like to use the client with.
            If you are using relative URLs in the other URL fields, this URL will be prepended to them.
            You can leave this field empty and specify the full path below."
        />

        <q-input
          v-model="client.baseUrl"
          filled
          type="text"
          label="Home URL"
          hint="A URL the IdP can redirect the user to if it needs to link the application or just redirect the user back to the application."
        />

        <FormListInput
          v-model="client.redirectUris"
          name="redirect-uris"
          filled
          :defaultOpened="true"
          inputLabel="Redirect URI"
          headerLabel="Allowed Redirect URIs"
          hint="URLs allowed to be redirected to. Simple wildcards like 'http://example.org/*'' are supported.
            Please narrow down the selection as much as possible as this prevents open redirects via the IdP.
            Relative paths are supported in combination with Root URL."
        />

        <FormListInput
          v-model="client.webOrigins"
          name="web-origins"
          filled
          :defaultOpened="false"
          inputLabel="Web Origin"
          headerLabel="Allowed Web Origins"
          hint="Allowed CORS origins. Simple wildcards like 'http://example.org/*'' are supported.
            Specify '+' to apply all valid redirect URIs as valid CORS origins.
            Please narrow down the selection as much as possible as this prevents open redirects via the IdP.
            Relative paths are supported in combination with Root URL."
        />

        <h2 class="q-mt-xl">Logout</h2>

        <q-list bordered>
          <q-expansion-item
            group="logout-options"
            icon="warning"
            label="No logout support"
            default-opened
            :header-class="
              client.backchannelLogoutUrl === '' && !client.frontchannelLogout
                ? 'text-primary'
                : ''
            "
          >
            <q-card>
              <q-card-section>
                <p>
                  You have selected no logout support. This means, a user logged
                  in through the Identity Provider will not be logged out on
                  your application when the user ends the session on the IdP.
                </p>
                <p>Imagine the following scenario:</p>

                <ol>
                  <li>User logs in to the IdP and to your application.</li>
                  <li>
                    User uses the same session (single sign on) to log in to
                    another service
                  </li>
                  <li>User ends session at the IdP via the other service</li>
                  <li>
                    The session with your application is still running, although
                    the user might think all sessions has been ended.
                  </li>
                </ol>

                <p>
                  For this use case, you have the option to integrate either a
                  Frontchannel Logout or a Backchannel Logout. Please use them
                  if your application is starting an own session (like Nextcloud
                  or Moodle).
                </p>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-separator />

          <q-expansion-item
            group="logout-options"
            :icon="
              client.backchannelLogoutUrl !== '' ? 'verified_user' : 'logout'
            "
            label="Backchannel Logout"
            :model-value="client.backchannelLogoutUrl !== ''"
            :header-class="
              client.backchannelLogoutUrl !== '' ? 'text-primary' : ''
            "
          >
            <q-card>
              <q-card-section>
                <p>
                  You have selected backchannel logout support. Your service
                  will be notified if a session on the IdP is ended. If your
                  service is unable to handle the request it is silently dropped
                  by the IdP. Use this mode only, if the IdP is able to connect
                  to your service.
                </p>

                <p>Imagine the following scenario:</p>

                <ol>
                  <li>User logs in to the IdP and to your application.</li>
                  <li>User ends session at the IdP via the other service</li>
                  <li>
                    Your service will be notified and should revoke all sessions
                    created from the IdP session.
                  </li>
                </ol>

                <p>
                  To get a working logout setup, please fill the following
                  configuration:
                </p>
                <div class="q-gutter-md">
                  <q-input
                    v-model="client.backchannelLogoutUrl"
                    filled
                    type="url"
                    label="Backchannel logout URL"
                    hint="This URL will be requested on a backchannel logout. Make sure it is reachable by the IdP."
                  />
                  <q-toggle
                    v-model="client.backchannelLogoutSessionRequired"
                    label="Add session ID claim in logout request token"
                  />
                  <q-toggle
                    v-model="client.backchannelLogoutRevokeOfflineTokens"
                    label="Support revoking offline sessions"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-separator />

          <q-expansion-item
            group="logout-options"
            :icon="client.frontchannelLogout ? 'verified_user' : 'logout'"
            label="Frontchannel Logout"
            :model-value="client.frontchannelLogout"
            :header-class="client.frontchannelLogout ? 'text-primary' : ''"
          >
            <q-card>
              <q-card-section>
                <p>
                  You have selected frontchannel logout support. Your service
                  will be notified if a session on the IdP is ended via the
                  users web browser. If your service is unable to handle the
                  request, the user will get stuck connecting to your service.
                </p>

                <p>Imagine the following scenario:</p>

                <ol>
                  <li>User logs in to the IdP and to your application.</li>
                  <li>User ends session at the IdP via the other service</li>
                  <li>
                    User gets redirected to your service to end the session with
                    your service.
                  </li>
                  <li>
                    User gets redirected back to the IdP from your service (you
                    are responsible, otherwise other sessions might not be ended
                    correctly!)
                  </li>
                </ol>

                <p>
                  To get a working logout setup, please fill the following
                  configuration:
                </p>
                <div class="q-gutter-md">
                  <q-input
                    v-model="client.frontchannelLogoutUrl"
                    filled
                    type="url"
                    label="Frontchannel logout URL"
                    hint="Users will be redirected to this URL during logout."
                    @blur="
                      client.frontchannelLogout =
                        client.frontchannelLogoutUrl.length > 0
                    "
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>

        <FormListInput
          v-model="client.postLogoutRedirectUris"
          name="post-logout-uris"
          filled
          :defaultOpened="false"
          inputLabel="Allowed Post Logout URI"
          headerLabel="Allowed Post Logout URIs"
          hint="Allowed URIs the user is allowed to get redirected to after a logout.
            Simple wildcards like 'http://example.org/*'' are supported. Specify '+' to apply all valid redirect URIs as valid CORS origins.
            Please narrow down the selection as much as possible as this prevents open redirects via the IdP.
            Relative paths are supported in combination with Root URL."
        />

        <div class="row justify-end q-mt-md">
          <q-btn
            v-if="isEditForm"
            class="q-mr-sm"
            outline
            label="Delete"
            color="negative"
            @click="confirmDeletionDialog = true"
          />
          <q-dialog v-model="confirmDeletionDialog">
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar icon="warning" text-color="negative" />
                <span class="q-ml-sm">Are you sure to permanently delete client <code>{{ client.clientId }}</code>?</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat label="Cancel" color="primary" />
                <q-btn v-close-popup flat label="Delete" color="negative" @click="deleteClient()" />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-btn
            v-if="!isEditForm"
            class="q-mr-sm"
            outline
            label="Reset"
            color="negative"
            @click="confirmResetDialog = true"
          />
          <q-dialog v-model="confirmResetDialog">
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar icon="warning" text-color="negative" />
                <span class="q-ml-sm">Are you sure to reset the form?</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat label="Cancel" color="primary" />
                <q-btn v-close-popup flat label="Reset" color="negative" @click="resetForm()" />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-btn
            :label="isEditForm ? 'Save' : 'Create'"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { copyToClipboard } from 'quasar'
import { Ref, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import FormListInput from 'src/components/FormListInput.vue'
import { Notifier } from 'src/components/notifier/Notifier'
import { IWritableClient } from 'src/definitions/Client'
import { KeycloakRequestAPI } from 'src/requestAPI/KeycloakRequestAPI'

defineOptions({
  name: 'ClientsEdit',
})

const loading = ref(true)

const route = useRoute()
const router = useRouter()

const clientUuid: Ref<string | null> = ref(
  typeof route.params.clientUuid === 'string'
    ? (route.params.clientUuid)
    : null,
)

watch(
  () => route.params.clientUuid,
  (newId) => {
    if (typeof newId !== 'string') {
      clientUuid.value = null
      return
    }
    clientUuid.value = newId
    loadClient()
  },
)

const isEditForm = computed(() => clientUuid.value !== null)

const defaultClient = {
  clientId: 'ssc-',
  name: '',
  description: '',
  rootUrl: '',
  baseUrl: '',
  enabled: true,
  redirectUris: [],
  webOrigins: ['+'],
  publicClient: false,
  frontchannelLogout: false,
  backchannelLogoutRevokeOfflineTokens: false,
  backchannelLogoutSessionRequired: true,
  backchannelLogoutUrl: '',
  frontchannelLogoutUrl: '',
  postLogoutRedirectUris: ['+'],
}

const client: Ref<IWritableClient> = ref(defaultClient)

async function loadClient() {
  if (clientUuid.value === null) {
    loading.value = false
    return
  }
  const loadResult = await KeycloakRequestAPI.clientGet(
    clientUuid.value,
  )
  client.value = loadResult.data
  loading.value = false
}
loadClient()

async function saveClient() {
  loading.value = true
  try {
    if (clientUuid.value === null) {
      const saveResult = await KeycloakRequestAPI.clientCreate(client.value)
      Notifier.showDefaultSaveSuccessMessage()

      client.value = saveResult.data
      clientUuid.value = saveResult.data.id
      router.push({ name: 'ClientEdit', params: { clientUuid: clientUuid.value } })
    } else {
      await KeycloakRequestAPI.clientUpdate(
        clientUuid.value,
        client.value,
      )
      Notifier.showDefaultSaveSuccessMessage()
    }
  } finally {
    loading.value = false
  }
}

const confirmDeletionDialog = ref(false)
async function deleteClient() {
  loading.value = true
  try {
    await KeycloakRequestAPI.clientDelete(clientUuid.value as string)
    router.push({ name: 'ClientsList' })
  } finally {
    loading.value = false
  }
}

const confirmResetDialog = ref(false)
function resetForm() {
  client.value = defaultClient
}
</script>

<style lang="scss">
.form-toggle-item {
  padding-left: 0;
}
</style>
