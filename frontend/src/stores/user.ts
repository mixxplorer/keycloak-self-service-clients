import { OidcClient, StringMap } from '@axa-fr/oidc-client'
import { defineStore } from 'pinia'

import { IDP_CALLBACK_URI } from 'src/app-constants'
import { Notifier } from 'src/components/notifier/Notifier'
import { IUserInfo } from 'src/definitions/UserInfo'
import { OidcUtils } from 'src/utils/oidc'

export enum UserLoadingState {
  LOADING,
  UNDECIDED,
  AUTHENTICATED,
  UNAUTHENTICATED,
  ERROR,
}

export interface IUserState {
  loadingState: UserLoadingState;
  userInfo: IUserInfo | null;
  idpOidcClient: OidcClient;
  idpErrorNotificationClose: (() => void) | null;
}

export const useUserStore = defineStore('user', {
  state: (): IUserState => {
    const oidcClient = OidcUtils.getNewOidcClient()
    return {
      loadingState: UserLoadingState.LOADING,
      userInfo: null,
      idpOidcClient: oidcClient,
      idpErrorNotificationClose: null,
    }
  },

  getters: {
    hasValidTokens(): boolean {
      return this.authenticated && Date.now() > this.idpOidcClient.tokens.expiresAt * 1000
    },

    authenticated(): boolean {
      return this.userInfo !== null && this.loadingState === UserLoadingState.AUTHENTICATED
    },
  },

  actions: {
    async loadUser(): Promise<void> {
      this.idpOidcClient.subscribeEvents((name, data) => {
        if (['token_aquired', 'token_renewed'].includes(name)) {
          if (this.idpErrorNotificationClose !== null) {
            this.idpErrorNotificationClose()
            this.idpErrorNotificationClose = null
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          this.userInfo = this.idpOidcClient.tokens.idTokenPayload as IUserInfo
          this.loadingState = UserLoadingState.AUTHENTICATED
        } else if ([
          'token_timer',
          'loginAsync_begin',
          'loginCallbackAsync_begin',
          'loginCallbackAsync_end',
          'refreshTokensAsync_begin',
          'refreshTokensAsync_end',
        ].includes(name)) {
          // ignore these events, they are not useful for us
        } else if (name === 'loginCallbackAsync_error') {
          if (this.idpErrorNotificationClose !== null) {
            this.idpErrorNotificationClose()
            this.idpErrorNotificationClose = null
          }
          if ((data as Error).message.includes('login_required')) {
            // handle aborted / invalid login event from IdP
            this.loadingState = UserLoadingState.UNAUTHENTICATED
          } else {
            this.idpErrorNotificationClose = Notifier.showErrorMessage('Login failed, please try again.', false)
          }
        } else if (name === 'logout_from_another_tab' || (
          name === 'refreshTokensAsync_error' && (data as Error).message.includes('session lost'))
        ) {
          this.loadingState = UserLoadingState.UNAUTHENTICATED
          window.location.reload()
        } else {
          // eslint-disable-next-line no-console
          console.log(`OIDC (error) event ${name}!`)
          // eslint-disable-next-line no-console
          console.log(data)
          if (this.idpErrorNotificationClose !== null) {
            this.idpErrorNotificationClose()
            this.idpErrorNotificationClose = null
          }
          this.idpErrorNotificationClose = Notifier.showErrorMessage(`Error handling OIDC tokens! You might not be able to save any of
            your work. Error code: ${name}, data=${data as string}`, false)
        }
      })

      // check for callback
      if (
        (process.env.VUE_ROUTER_MODE === 'history' &&
          window.location.href.startsWith(OidcUtils.generateRedirectUri())) ||
        (process.env.VUE_ROUTER_MODE === 'hash' &&
          window.location.href.endsWith(IDP_CALLBACK_URI))
      ) {
        const redirectUrl = OidcUtils.getRedirectUrl('default')
        try {
          // this call will set the loading state to authenticated once tokens become available
          const loginCallback = await this.idpOidcClient.loginCallbackAsync()
          if (loginCallback.callbackPath !== undefined) {
            // redirect user back to original URL
            await this.router.replace(loginCallback.callbackPath)
          }
        } catch (err) {
          const castErr: Error = err as Error
          // handle IdP login_required error
          if (castErr.message.includes('login_required')) {
            this.loadingState = UserLoadingState.UNAUTHENTICATED
            // redirect user back to original URL
            await this.router.replace(redirectUrl)
          } else {
            // just re-throw the error
            throw err
          }
        }
      } else {
        // we did no load any user, but finished loading, so we should get the user state (start login, but without prompting)
        this.loadingState = UserLoadingState.UNDECIDED
        await this.loginUser(false)
      }
    },

    // Logs in a user. The user will be, on successful login, redirected to postLoginUrl.
    // If this is not set, the current path will be used.
    // If require is false, it is just checked whether the user can be logged in, but no user interaction will take place.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async loginUser(require?: boolean, postLoginUrl?: string): Promise<void> {
      if (this.loadingState === UserLoadingState.AUTHENTICATED) {
        // return early as we are already authenticated
        return
      }
      if (require === false && this.loadingState === UserLoadingState.UNAUTHENTICATED) {
        // return as we already know the user has no IdP session, so we don't need to check again
        return
      }
      if (this.loadingState === UserLoadingState.LOADING) {
        // eslint-disable-next-line no-console
        console.log('Ignoring login request as user is still loading!')
        return
      }

      if (postLoginUrl === undefined) {
        if (process.env.VUE_ROUTER_MODE === 'hash') {
          postLoginUrl = window.location.hash.substring(1)
        } else {
          postLoginUrl =
            window.location.pathname +
            window.location.search +
            window.location.hash
        }
      }

      const extras: StringMap = {}
      if (require === false) {
        extras.prompt = 'none'
      }

      await this.idpOidcClient.loginAsync(postLoginUrl, extras)

      // just wait forever
      await new Promise(() => {
        // intentionally empty
      })
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async logoutUser(postLogoutUrl: string): Promise<void> {
      if (!this.authenticated) {
        return
      }

      await this.idpOidcClient.logoutAsync()
    },
  },
})
