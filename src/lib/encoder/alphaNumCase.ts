import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars:
//    lower: abcdefghijklmnopqrstuvwxyz0123456789
//    upper: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789

export default (uppercase = false): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + decimal
    return n - 10 + alpha
  }

  return boundEncoder(puidEncoder, 36)
}
