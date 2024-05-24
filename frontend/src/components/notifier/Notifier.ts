/* eslint @typescript-eslint/ban-types: 0 */
import { Notify } from 'quasar'
export class Notifier {
  // Chose return type Function because Quasar is returning it as well
  public static showSuccessMessage(message: string, timeout = 2500): Function {
    return Notify.create({
      type: 'positive',
      message,
      color: 'primary',
      closeBtn: false,
      actions: [
        {
          label: 'Close',
          color: 'white',
        },
      ],
      timeout,
    })
  }

  public static showWarningMessage(message: string): Function {
    return Notify.create({
      type: 'warning',
      message,
    })
  }

  public static showErrorMessage(
    message: string,
    closeBtn?: string | boolean,
  ): Function {
    const actionList = []
    if (closeBtn === undefined || closeBtn === true) {
      actionList.push({
        label: 'Close',
        color: 'white',
      })
    } else if (closeBtn) {
      actionList.push({
        label: closeBtn,
        color: 'white',
      })
    }

    return Notify.create({
      type: 'negative',
      message,
      timeout: 0,
      closeBtn: false,
      actions: actionList,
    })
  }

  public static showDefaultSaveSuccessMessage(): Function {
    return this.showSuccessMessage('Saving successful!')
  }
}
