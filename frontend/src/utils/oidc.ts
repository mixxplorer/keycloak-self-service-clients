// import { Notifier } from 'components/notifier/Notifier'
import { UserManager } from 'oidc-client-ts'

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

  public static getNewUserManager(): UserManager {
    const userManager = new UserManager({
      authority: IDP_URL,
      client_id: KEYCLOAK_CLIENT_ID,
      redirect_uri: this.generateRedirectUri(),
      stopCheckSessionOnError: false,
    })

    return userManager
  }
}
