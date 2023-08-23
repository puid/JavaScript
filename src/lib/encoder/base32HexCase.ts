import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: ABCDEFGHIJKLMNOPQRSTUVWXYZ234567
//   lower: 0123456789abcdefghijklmnopqrstuv
//   upper: 0123456789ABCDEFGHIJKLMNOPQRSTUV
//   ref: https://datatracker.ietf.org/doc/html/rfc4648#section-7

export default (uppercase = false): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + decimal
    return n - 10 + alpha
  }

  return boundEncoder(puidEncoder, 32)
}
