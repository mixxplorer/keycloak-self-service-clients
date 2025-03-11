/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { AxiosError } from 'axios'
import { boot } from 'quasar/wrappers'

import { Notifier } from 'src/utils/notifier'

interface ErrorPayload {
  error?: string;
  errorMessage?: string;
}

export default boot(({ app }): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  window.onerror = function (msg, url, line, col, error) {
    // eslint-disable-next-line no-console
    console.log(msg)
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    Notifier.showErrorMessage(`Uncaught exception: ${msg}`, true)
    return true
  }

  const appErrorHandler = function (generalError: Error | undefined) {
    if (
      generalError !== undefined &&
      generalError.name === 'AxiosError'
    ) {
      const axiosError = generalError as AxiosError<ErrorPayload>
      if (
        axiosError.response?.data !== undefined &&
        typeof axiosError.response?.data?.error === 'string'
      ) {
        Notifier.showErrorMessage(
          `Network request failed with "${axiosError.response?.data?.error}"
          (Status code ${axiosError.response?.status}). For more information see dev console.`,
          true,
        )
      } else if (
        axiosError.response?.data !== undefined &&
        typeof axiosError.response?.data?.errorMessage === 'string'
      ) {
        Notifier.showErrorMessage(
          `Network request failed with "${axiosError.response.data?.errorMessage}"
          (Status code ${axiosError.response.status}). For more information see dev console.`,
          true,
        )
      } else {
        Notifier.showErrorMessage(
          `Network request failed with "${axiosError.message}". For more information see dev console.`,
          true,
        )
      }

      return true
    }

    Notifier.showErrorMessage(
      `Unexpected error: "${generalError}". For more information see dev console.`,
      true,
    )
    return true
  }

  window.onunhandledrejection = function (errorEvent) {
    appErrorHandler(errorEvent.reason as Error)
  }

  // registering this error handler is specifically important as Vue seems to catch errors (and does not propagate them)
  // if thrown inside a try block, even if there is no catch and converts them implicitly to an app error.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.config.errorHandler = function (err, instance, info) {
    appErrorHandler(err as Error)
  }
})
