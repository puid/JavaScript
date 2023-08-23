import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars:
//   lower: 0123456789abcdef
//   upper: 0123456789ABCDEF

export default (uppercase = false): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + decimal
    return n - 10 + alpha
  }

  return boundEncoder(puidEncoder, 16)
}
