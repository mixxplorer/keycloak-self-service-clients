import { ErrorResponse, User, UserManager } from 'oidc-client-ts'
import { defineStore } from 'pinia'
import { RouteLocationRaw } from 'vue-router'

import { IDP_CALLBACK_URI } from 'src/app-constants'
import { Notifier } from 'src/components/notifier/Notifier'
import { OidcUtils } from 'src/utils/oidc'

export enum UserLoadingState {
  LOADING,
  LOADED,
  ERROR,
}

export interface IUserState {
  loadingState: UserLoadingState;
  userInfo: User | null;
  idpUserManager: UserManager;
}

interface IAuthenticationState {
  redirectUri: RouteLocationRaw;
}

export const useUserStore = defineStore('user', {
  state: (): IUserState => {
    const userManager = OidcUtils.getNewUserManager()
    return {
      loadingState: UserLoadingState.LOADING,
      userInfo: null,
      idpUserManager: userManager,
    }
  },

  getters: {
    hasValidTokens(): boolean {
      return !this.userInfo?.expired
    },

    authenticated(): boolean {
      return this.userInfo !== null
    },
  },

  actions: {
    async loadUser(): Promise<void> {
      // make sure we get notified about token refresh events
      this.idpUserManager.events.addUserLoaded((user) => {
        this.userInfo = user
      })

      this.idpUserManager.events.addSilentRenewError((error: Error) => {
        // eslint-disable-next-line no-console
        console.log(error)

        if (typeof error === 'object') {
          if (error.message !== undefined && error.message.includes('NetworkError')) {
            Notifier.showErrorMessage(
              'Refreshing your access token failed. Cannot connect to IdP.',
            )
            this.idpUserManager.startSilentRenew()
          } else if ((error as ErrorResponse).error === 'invalid_grant') {
            // user session has ended upstream
            this.idpUserManager.removeUser()
            this.userInfo = null

            Notifier.showErrorMessage(
              'Refreshing your access token failed. Your session has ended. You cannot save any information, please reload the page.',
            )
          } else {
            Notifier.showErrorMessage(
              'Refreshing your access token failed. Please make sure you have a working connection to your IdP.',
            )

            this.idpUserManager.startSilentRenew()
          }
        }
      })

      this.idpUserManager.events.addAccessTokenExpired(() => {
        Notifier.showErrorMessage('Your access token has expired. Please make sure that you have a working internet connection.')
      })

      // check for callback
      if (
        (process.env.VUE_ROUTER_MODE === 'history' &&
          window.location.href.startsWith(OidcUtils.generateRedirectUri())) ||
        (process.env.VUE_ROUTER_MODE === 'hash' &&
          window.location.href.endsWith(IDP_CALLBACK_URI))
      ) {
        try {
          const user = await this.idpUserManager.signinCallback()
          if (user !== undefined) {
            this.userInfo = user
            this.loadingState = UserLoadingState.LOADED

            // redirect user back to original URL
            if (user.state !== undefined) {
              const userState = user.state as IAuthenticationState
              await this.router.replace(userState.redirectUri)
            }

            // intentionally, we do not await this promise here as we are not interested in the outcome
            // we just want to trigger the process.
            this.idpUserManager.clearStaleState()

            this.idpUserManager.startSilentRenew()

            return
          }
        } catch (err) {
          // just ignore the error as it might say no state found in storage
          // eslint-disable-next-line no-console
          console.warn(err)
        }
      }

      const user = await this.idpUserManager.getUser()
      if (user === null) {
        // eslint-disable-next-line no-console
        console.debug('No user loaded!')
      } else if (user.expired) {
        // eslint-disable-next-line no-console
        console.debug('Found user, but user has already expired tokens')
      } else {
        this.idpUserManager.startSilentRenew()
        this.userInfo = user
        this.loadingState = UserLoadingState.LOADED
      }
    },

    async loginUser(postLoginUrl?: string): Promise<void> {
      if (this.authenticated) {
        // return early as we are already authenticated
        return
      }

      let currentRoute =
        window.location.pathname +
        window.location.search +
        window.location.hash
      if (process.env.VUE_ROUTER_MODE === 'hash') {
        currentRoute = window.location.hash.substring(1)
      }

      const authenticationState: IAuthenticationState = {
        redirectUri: postLoginUrl === undefined ? currentRoute : postLoginUrl,
      }

      await this.idpUserManager.signinRedirect({ state: authenticationState })
    },

    async logoutUser(postLogoutUrl: string): Promise<void> {
      if (!this.authenticated) {
        return
      }

      await this.idpUserManager.signoutRedirect({
        post_logout_redirect_uri: postLogoutUrl,
      })
    },
  },
})
