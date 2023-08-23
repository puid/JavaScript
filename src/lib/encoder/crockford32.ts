import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: 0123456789ABCDEFGHJKMNPQRSTVWXYZ
//   ref: https://www.crockford.com/base32.html
//
// Mapping
//   n: 0123456789 01234567 89 01 23456 78901
//   c: 0123456789 ABCDEFGH JK MN PQRST VWXYZ

export default (): PuidEncoder => {
  const zero = '0'.charCodeAt(0)
  const A = 'A'.charCodeAt(0)
  const J = 'J'.charCodeAt(0)
  const M = 'M'.charCodeAt(0)
  const P = 'P'.charCodeAt(0)
  const V = 'V'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + zero
    if (n < 18) return n - 10 + A
    if (n < 20) return n - 18 + J
    if (n < 22) return n - 20 + M
    if (n < 27) return n - 22 + P
    return n - 27 + V
  }

  return boundEncoder(puidEncoder, 32)
}
