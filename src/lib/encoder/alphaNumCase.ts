import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars:
//    lower: abcdefghijklmnopqrstuvwxyz0123456789
//    upper: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789

export default (uppercase = false, digitsFirst = false): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (digitsFirst) {
      if (n < 10) return n + decimal
      return n - 10 + alpha
    }
    if (n < 26) return n + alpha
    return n - 26 + decimal
  }

  return boundEncoder(puidEncoder, 36)
}
