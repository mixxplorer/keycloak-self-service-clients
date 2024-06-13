import { AxiosError, AxiosResponse } from 'axios'

import { Notifier } from 'components/notifier/Notifier'
import { DEFAULT_REQUEST_RETRY_TIME } from 'src/app-constants'
import { NetworkError } from 'src/requestAPI/Errors'
import { useUserStore } from 'src/stores/user'

enum ErrorType {
  Network,
  RateLimit,
}

export class BaseAPI {
  protected static get token(): string {
    const userStore = useUserStore()
    return userStore.idpOidcClient.tokens.accessToken
  }

  protected static async checkAuthorizationToken(): Promise<void> {
    const userStore = useUserStore()
    if (!userStore.hasValidTokens) {
      await userStore.idpOidcClient.getValidTokenAsync(200, 50)
    }
  }

  protected static async checkNetworkConnectivityWrapper(
    networkRequest: () => Promise<AxiosResponse>,
    preRequestHook: () => Promise<void>,
  ): Promise<AxiosResponse> {
    let errorMessageDismiss = null
    let errorType: ErrorType | null = null
    let retryTime: number | null = null
    while (true) {
      if (retryTime !== null) {
        // Just wait preset time between requests
        await new Promise((resolve) =>
          setTimeout(resolve, retryTime as number))
        retryTime = null
      }

      try {
        await preRequestHook()
        const result = await networkRequest()
        // hide previously created error message
        if (errorMessageDismiss) {
          errorMessageDismiss()
          errorMessageDismiss = null
          errorType = null
        }
        return result
      } catch (error) {
        const axiosError = error as AxiosError
        if (
          (!axiosError.response && axiosError.request) ||
          (error as NetworkError).name === 'NetworkError'
        ) {
          // Dismiss error message of different type
          if (errorMessageDismiss !== null && errorType !== ErrorType.Network) {
            errorMessageDismiss()
            errorMessageDismiss = null
            errorType = null
          }

          // Create new message only when no message (of this type) is already shown
          if (errorMessageDismiss === null) {
            errorMessageDismiss = Notifier.showErrorMessage(
              'No server connection. Please check your internet connection.',
              false,
            )
            errorType = ErrorType.Network
          }

          retryTime = DEFAULT_REQUEST_RETRY_TIME
        } else if (
          axiosError?.response !== undefined &&
          axiosError.response.status === 429
        ) {
          // Dismiss error message of different type
          if (
            errorMessageDismiss !== null &&
            errorType !== ErrorType.RateLimit
          ) {
            errorMessageDismiss()
            errorMessageDismiss = null
            errorType = null
          }

          // Create a new error only when no message (of this type) is already shown
          if (errorMessageDismiss === null) {
            errorMessageDismiss = Notifier.showErrorMessage(
              'The server received too many requests from you. Please wait a moment.',
              false,
            )
            errorType = ErrorType.RateLimit
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          retryTime =
            +axiosError.response.headers[
              'x-rate-limit-retry-after-milliseconds'
            ]
          if (isNaN(retryTime)) {
            retryTime = DEFAULT_REQUEST_RETRY_TIME
          }
        } else {
          throw error
        }
      }
    }
  }

  /**
   * This is a wrapper to handle internet outages as well as needed token refreshments.
   *
   * For the token refreshes, it is necessary that you ONLY set the authorization header in the lambda function
   * called by this function (networkRequest)
   *
   * @param networkRequest: lambda function, which gets called when network request is executed.
   *                        Can be called multiple times until it succeeds.
   * @protected
   */
  protected static async networkResultWrapper(
    networkRequest: () => Promise<AxiosResponse>,
  ): Promise<AxiosResponse> {
    return this.checkNetworkConnectivityWrapper(networkRequest, () =>
      this.checkAuthorizationToken())
  }
}
