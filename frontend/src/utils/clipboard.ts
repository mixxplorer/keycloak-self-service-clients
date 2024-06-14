import { copyToClipboard as copyToClipboardOrig } from 'quasar'

import { Notifier } from 'src/utils/notifier'

export async function copyToClipboard(text: string): Promise<void> {
  await copyToClipboardOrig(text)
  Notifier.showSuccessMessage('Copied value to clipboard!', 2500)
}
