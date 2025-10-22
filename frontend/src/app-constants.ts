/*
 * Gets a string defined by an environment value. This function is used to pass variables into the app after building it.
 *
 * @param key: key of environment variable
 * @param defaultVal: Default value, returned if environment variable is not set.
 * @param environVal: Default value coming from environment. Has to be passed as process.env.SOMEVAL will be replaced
 *                    during compilation.
 */
function getEnvironmentValue(
  key: string,
  defaultVal: string,
  environVal?: string,
): string {
  if ('APP_ENVIRONMENT' in window) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const val = (window.APP_ENVIRONMENT as Record<string, string>)[key]
    if (val) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return val
    }
  }
  if (environVal) {
    return environVal
  }

  return defaultVal
}

export const APP_BASE_URL = window.location.origin

// OIDC IdP settings
export const KEYCLOAK_URL = getEnvironmentValue(
  'KEYCLOAK_URL',
  'https://keycloak.example.org',
  process.env.KEYCLOAK_URL,
)
export const KEYCLOAK_REALM = getEnvironmentValue(
  'KEYCLOAK_REALM',
  'test',
  process.env.KEYCLOAK_REALM,
)
export const KEYCLOAK_CLIENT_ID = getEnvironmentValue(
  'KEYCLOAK_CLIENT_ID',
  'self-service-clients',
  process.env.KEYCLOAK_CLIENT_ID,
)
export const IDP_CALLBACK_URI = '/oidc/callback'

export const IDP_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`
export const KEYCLOAK_ADMIN_URL = `${KEYCLOAK_URL}/admin/${KEYCLOAK_REALM}`

export const VUE_APP_USER_ACCOUNT_CONSOLE_LINK = `${IDP_URL}/realms/${KEYCLOAK_REALM}/account`

export const KEYCLOAK_USER_ACCOUNT_CONSOLE_LINK = `${VUE_APP_USER_ACCOUNT_CONSOLE_LINK}?referrer=${KEYCLOAK_CLIENT_ID}&referrer_uri=`

export const DEFAULT_REQUEST_TIMEOUT = 30 * 1000 // in ms
export const DEFAULT_REQUEST_RETRY_TIME = 1500 // milliseconds until a request retry will be performed
