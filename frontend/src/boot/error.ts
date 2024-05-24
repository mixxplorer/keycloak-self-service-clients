/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { boot } from 'quasar/wrappers'

import { Notifier } from 'src/components/notifier/Notifier'

export default boot((): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  window.onerror = function (msg, url, line, col, error) {
    Notifier.showErrorMessage(`Uncaught exception: ${msg}`, true)
    return true
  }

  window.onunhandledrejection = function (errorEvent) {
    if (
      errorEvent.reason !== undefined &&
      errorEvent.reason.name === 'AxiosError'
    ) {
      if (
        errorEvent.reason.response.data !== undefined &&
        typeof errorEvent.reason.response.data.error === 'string'
      ) {
        Notifier.showErrorMessage(
          `Network request failed with "${errorEvent.reason.response.data.error}"
          (Status code ${errorEvent.reason.response.status}). For more information see dev console.`,
          true,
        )
      } else {
        Notifier.showErrorMessage(
          `Network request failed with "${errorEvent.reason.message}". For more information see dev console.`,
          true,
        )
      }

      return true
    }

    Notifier.showErrorMessage(
      `Unexpected error: "${errorEvent}". For more information see dev console.`,
      true,
    )
    return true
  }
})
