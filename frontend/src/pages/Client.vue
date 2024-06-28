<template>
  <q-page>
    <div class="page-content">
      <h1>
        View Client <strong>{{ client?.name }}</strong>
        <q-btn
          color="primary"
          class="q-ma-md"
          flat
          type="a"
          :to="{
            name: 'ClientEdit',
            params: { clientUuid: clientUuid },
          }"
        >
          Edit
        </q-btn>
      </h1>

      <div v-if="loading" class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="50px" />
      </div>
      <div v-else>
        <h2>Setup instructions</h2>
        <p>Congratulations! You have created your client! In order to set up the client, please follow these steps:</p>
        <q-list bordered class="rounded-borders">
          <q-expansion-item expand-separator>
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <h3 class="q-mb-none">OIDC general settings</h3>
                <q-item-label caption>
                  For this IdP.
                </q-item-label>
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <p>
                  Please set up your app to use the correct Open ID Connect (OIDC) Identity Provider (IdP) settings by utilizing either
                  automatic discovery (preferred) or manual set up:
                </p>

                <h3>Automatic discovery</h3>
                <p>If your app supports automatic Open ID Connect discovery, please use either of these URLs (depend on the application)</p>
                <ul>
                  <li>For most applications: <code>{{ IDP_URL }}</code> <ClipboardCopy :value="IDP_URL" /></li>
                  <li>
                    If the application requires the specific discovery endpoint:
                    <code>{{ idpDiscoveryEndpoint }}</code>
                    &nbsp;<ClipboardCopy :value="idpDiscoveryEndpoint" />
                  </li>
                </ul>

                <h3>Manual set up</h3>
                <p>
                  Some applications need you to enter specific endpoints manually. If you are an application developer, please use Open ID Connect discovery.
                </p>
                <p>
                  If you cannot do anything about it, please take a look at the
                  <a :href="idpDiscoveryEndpoint" target="_blank"> at the discovery endpoint</a>.
                </p>
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item expand-separator>
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="fingerprint" />
              </q-item-section>
              <q-item-section>
                <h3 class="q-mb-none">OIDC app settings</h3>
                <q-item-label caption>
                  Specific for {{ client?.name }}.
                </q-item-label>
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <p v-if="client?.publicClient">
                  You have chosen to use a public client. Therefore, there is only a client ID but no client secret.
                  With this client type, please double-check whether your URIs are set properly.
                </p>
                <p v-else>
                  You have chosen to use a secret client. Therefore, all requests on behalf of your app must be authenticated with a client secret.
                  Please configure these settings as client ID and client secret.
                </p>

                <p v-if="!client?.publicClient">
                  <strong>Important:</strong> If you cannot keep the secret secret (e.g. because you distribute your app like a Single Page Web App),
                  please use a public client!
                  If you leaked the client secret, please generate a new one.
                </p>

                <q-form>
                  <q-input
                    :modelValue="client?.clientId"
                    filled
                    label="Client ID"
                    :readonly="true"
                  >
                    <template v-slot:append>
                      <ClipboardCopy :value="client?.clientId as string" />
                    </template>
                  </q-input>

                  <template v-if="!client?.publicClient">
                    <q-input
                      :modelValue="hiddenClientSecret"
                      filled
                      label="Client Secret"
                      :readonly="true"
                      type="text"
                      @click="hiddenClientSecret = client?.secret as string"
                    >
                      <template v-slot:append>
                        <ClipboardCopy :value="client?.secret as string" />
                      </template>
                    </q-input>

                    <div class="row justify-end q-mt-md">
                      <q-btn outline color="negative" @click="confirmRegenerateClientSecretDialog = true">Regenerate Client Secret</q-btn>
                    </div>
                    <q-dialog v-model="confirmRegenerateClientSecretDialog">
                      <q-card>
                        <q-card-section class="row items-center">
                          <q-avatar icon="warning" text-color="negative" />
                          <span class="q-ml-sm">
                            Are you sure to regenerate the client secret?
                          </span>
                        </q-card-section>

                        <q-card-section>
                          The new client secret will the only valid secret immediately.
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn v-close-popup flat label="Cancel" color="primary" />
                          <q-btn v-close-popup flat label="Regenerate" color="negative" @click="regenerateClientSecret()" />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </template>
                </q-form>
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item expand-separator>
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="checklist" />
              </q-item-section>
              <q-item-section>
                <h3 class="q-mb-none">Compatibility checklist</h3>
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <p>
                  To ensure smooth operation with your client, we encourage you to test the following functionality.
                  Typically, it makes sense make all tests pass in order to provide a secure and convenient user experience.
                </p>

                <p>
                  Unfortunately, most of these tests cannot be done automatically.
                  Therefore you must make sure to comply with them manually.
                </p>

                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="link" />
                    </q-item-section>
                    <q-item-section>
                      <h4>Secure URIs</h4>
                      <p>
                        Do you have control over all URIs you set in the configuration?
                        If you allow URIs you do not control, you might allow an open redirect or even stealing of application tokens.
                      </p>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="login" />
                    </q-item-section>
                    <q-item-section>
                      <h4>Login</h4>
                      <q-item-label>Is the login working correctly for your application?</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>
                      <h4>Logout</h4>
                      <p>
                        Is the log out button working from your app? Does it end the session on the Keycloak as well?
                        You should test that by logging out of your app directly after login and the re-login.
                        You should now need to re-authenticate (enter your credentials) at Keycloak.
                      </p>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="sync" />
                    </q-item-section>
                    <q-item-section>
                      <h4 class="q-mb-none">Session handling</h4>
                      <q-item-label class="q-mb-sm" caption>
                        You can skip this check if your application is using the refresh token properly (opens no own session).
                      </q-item-label>
                      <p>
                        Is your back-channel or front-channel logout working?
                        Or with other words: Is the session within your app ended once the Keycloak session is ended?
                      </p>
                      <p>
                        This is particularly important as users might expect to be logged out of all apps they use with Single-Sign-On.
                        When your service does not close its own internal session correctly when a user presses the logout button in another app,
                        a false impression of security may be created.
                        <br>
                        An example:
                      </p>
                      <ol>
                        <li>A user logs in to a particular app (App 1), a Keycloak session will be opened.</li>
                        <li>
                          The user accesses another app (App 2), which requires a login. As the user is already authenticated the redirection to Keycloak
                          (and thus the authentication) is invisible to the user (Single Sign On).
                        </li>
                        <li>
                          On logout, with non-working single logout, only the session on App 1 or App 2 will be ended.
                          But the app is probably telling the user that the "session has ended"
                        </li>
                        <li>The user might wrongly believe that this ended all sessions, but this would not be the case.</li>
                      </ol>
                      <p>
                        You should test a working front- or back-channel logout by logging in to your application,
                        then logout from another app (e.g. <a @click="userStore.logoutUser('/')">log out here</a>).
                        Now, the session within your app should be ended or should end very soon (in about 2 minutes).
                      </p>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>

        <h2 class="q-mt-lg">Client settings</h2>
        <p>Some settings of the client can only changed by admins of this Keycloak instance. Some of them are shown here:</p>

        <q-list bordered class="rounded-borders">
          <q-item v-if="!client?.publicClient">
            <q-item-section avatar>
              <q-icon name="badge" />
            </q-item-section>
            <q-item-section>
              <h3 v-if="client?.serviceAccountsEnabled">Service Accounts Enabled</h3>
              <h3 v-else>Service Accounts Disabled</h3>
              <p v-if="client?.serviceAccountsEnabled">
                The admins enabled the Service Account for this client.
              </p>
              <p v-else caption>
                The application cannot use your client credentials to authenticate against other services.
              </p>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="password" />
            </q-item-section>
            <q-item-section>
              <h3 v-if="client?.standardFlowEnabled">Standard Authentication Flows Enabled</h3>
              <h3 v-else>Standard Authentication Flows Disabled</h3>
              <p v-if="client?.standardFlowEnabled">
                The application can make use of the standard authentication flows.
                These include the <a href="https://tools.ietf.org/html/rfc6749#section-1.3.1" target="_blank">Authorization Code Flow</a>
                and <a href="https://tools.ietf.org/html/rfc7636#section-4" target="_blank">Authorization Code Flow with Proof Key for Code Exchange (PKCE)</a>.
                <br>
                For web apps, please make sure to use the PKCE flow whenever possible.
              </p>
              <p v-else caption>
                The application cannot use the standard authentication flows.
              </p>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="password" />
            </q-item-section>
            <q-item-section>
              <h3 v-if="client?.directAccessGrantsEnabled">Direct Access Grants Enabled</h3>
              <h3 v-else>Direct Access Grants Disabled</h3>
              <p v-if="client?.directAccessGrantsEnabled">
                The application can make use of the <a href="https://tools.ietf.org/html/rfc6749#section-1.3.4" target="_blank">client credential grant</a>.
                <br>
                Using this grant type shares the credentials of the users with the application and is therefore considered potentially insecure and deprecated.
              </p>
              <p v-else caption>
                The application cannot use the <a href="https://tools.ietf.org/html/rfc6749#section-1.3.4" target="_blank">client credential grant</a>.
                <br>
                Using this grant type shares the credentials of the users with the application and is therefore considered potentially insecure and deprecated.
              </p>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="password" />
            </q-item-section>
            <q-item-section>
              <h3 v-if="client?.implicitFlowEnabled">Implicit Flow Enabled</h3>
              <h3 v-else>Implicit Flow Disabled</h3>
              <p v-if="client?.implicitFlowEnabled">
                The application can make use of the <a href="https://tools.ietf.org/html/rfc6749#section-1.3.2" target="_blank">implicit flow</a>.
                <br>
                This flow is deprecated and considered insecure.
                <br>
                Please migrate to another flow and ensure this flow is switched off in this client afterwards.
              </p>
              <p v-else caption>
                The application cannot make use of the <a href="https://tools.ietf.org/html/rfc6749#section-1.3.2" target="_blank">implicit flow</a>.
                <br>
                This flow is deprecated and considered insecure.
              </p>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { IDP_URL } from 'src/app-constants'
import ClipboardCopy from 'src/components/ClipboardCopy.vue'
import { IClient } from 'src/definitions/Client'
import { KeycloakRequestAPI } from 'src/requestAPI/KeycloakRequestAPI'
import { useUserStore } from 'src/stores/user'
import { Notifier } from 'src/utils/notifier'

defineOptions({
  name: 'ClientsEdit',
})

const loading = ref(true)

const route = useRoute()
const userStore = useUserStore()

const clientUuid: Ref<string> = ref(route.params.clientUuid as string)

watch(
  () => route.params.clientUuid,
  (newId) => {
    clientUuid.value = newId as string
    loadClient()
  },
)

const client: Ref<IClient | null> = ref(null)

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

const idpDiscoveryEndpoint = IDP_URL + '/.well-known/openid-configuration'

const defaultHiddenClientSecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const hiddenClientSecret = ref(defaultHiddenClientSecret)
const confirmRegenerateClientSecretDialog = ref(false)
const regenerateSecretLoading = ref(false)
async function regenerateClientSecret() {
  regenerateSecretLoading.value = true
  try {
    const loadResult = await KeycloakRequestAPI.clientRegenerateSecret(clientUuid.value)
    client.value = loadResult.data
    hiddenClientSecret.value = defaultHiddenClientSecret
    Notifier.showSuccessMessage('Regenerated client secret!')
  } finally {
    regenerateSecretLoading.value = false
  }
}
</script>

<style lang="scss">
.form-toggle-item {
  padding-left: 0;
}
</style>
