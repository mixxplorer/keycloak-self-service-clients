export class NetworkError implements Error {
  message: string
  name = 'NetworkError'

  constructor(message: string) {
    this.message = message
  }
}
