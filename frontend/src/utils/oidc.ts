// import { Notifier } from 'components/notifier/Notifier'
import { OidcClient, OidcConfiguration, TokenAutomaticRenewMode } from '@axa-fr/oidc-client'

import {
  APP_BASE_URL,
  IDP_CALLBACK_URI,
  KEYCLOAK_CLIENT_ID,
  IDP_URL,
} from 'src/app-constants'

export class OidcUtils {
  /**
   * Generates a redirect Uri, which is compatible with all supported platforms
   * @param appRedirectUri Uri to redirect to, must be relative to the app base path
   */
  public static generateRedirectUri(): string {
    let appRedirectUri = IDP_CALLBACK_URI
    // strip leading / from redirectUri
    if (appRedirectUri.length > 0 && appRedirectUri.startsWith('/')) {
      appRedirectUri = appRedirectUri.slice(1)
    }

    // Prepend uri with app base url
    if (process.env.VUE_ROUTER_MODE === 'hash') {
      appRedirectUri = `${APP_BASE_URL}/#/${appRedirectUri}`
    } else {
      // On all platforms other than cordova we are using history mode for the router
      appRedirectUri = `${APP_BASE_URL}/${appRedirectUri}`
    }
    return appRedirectUri
  }

  public static getNewOidcClient(): OidcClient {
    // const userManager = new UserManager({
    //   authority: IDP_URL,
    //   client_id: KEYCLOAK_CLIENT_ID,
    //   redirect_uri: this.generateRedirectUri(),
    //   stopCheckSessionOnError: false,
    // })

    const configuration: OidcConfiguration = {
      client_id: KEYCLOAK_CLIENT_ID,
      redirect_uri: this.generateRedirectUri(),
      scope: 'openid profile',
      authority: IDP_URL,
      service_worker_activate: () => false,
      token_automatic_renew_mode: TokenAutomaticRenewMode.AutomaticBeforeTokenExpiration,
      refresh_time_before_tokens_expiration_in_second: 30,
      storage: sessionStorage,
    }

    const oidcClient = OidcClient.getOrCreate(() => fetch)(configuration)

    return oidcClient
  }

  // get redirect URL before getting real tokens as we have no possibility to get the URL when login fails e.g.
  // with `login_required`, see also https://github.com/AxaFrance/oidc-client/issues/1375
  // This is quite a hack, will remove once the library supports this use case.
  public static getRedirectUrl(configurationName: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const storageRes = sessionStorage.getItem(`oidc.login.${configurationName}`)

    if (storageRes !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const storageJson = JSON.parse(storageRes)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return storageJson.callbackPath as string
    }
    throw Error('Redirect Url not set in session storage!')
  }
}
