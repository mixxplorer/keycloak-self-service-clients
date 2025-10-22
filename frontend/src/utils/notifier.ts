import { Notify, QNotifyUpdateOptions } from 'quasar'
export class Notifier {
  // Chose return type Function because Quasar is returning it as well
  public static showSuccessMessage(message: string, timeout = 2500): (props?: QNotifyUpdateOptions) => void {
    return Notify.create({
      type: 'positive',
      message,
      color: 'green',
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

  public static showWarningMessage(message: string): (props?: QNotifyUpdateOptions) => void {
    return Notify.create({
      type: 'warning',
      message,
    })
  }

  public static showErrorMessage(
    message: string,
    closeBtn?: string | boolean,
  ): (props?: QNotifyUpdateOptions) => void {
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

  public static showDefaultSaveSuccessMessage(): (props?: QNotifyUpdateOptions) => void {
    return this.showSuccessMessage('Changes successfully saved!')
  }
}
