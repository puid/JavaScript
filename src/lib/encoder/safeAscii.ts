import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: !#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{\|}~
//   ref: Printable ascii that does not require escape in String
//
// Mapping
//   n: 0 1234 5678901234567890123456789012345678901234567890123456 789 012345678901234567890123456789
//   c: ! #$%& ()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[ ]^_ abcdefghijklmnopqrstuvwxyz{|}~

export default (): PuidEncoder => {
  const bang = '!'.charCodeAt(0)
  const hash = '#'.charCodeAt(0)
  const openParen = '('.charCodeAt(0)
  const closeSquareBracket = ']'.charCodeAt(0)
  const a = 'a'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n === 0) return bang
    if (n < 5) return n - 1 + hash
    if (n < 57) return n - 5 + openParen
    if (n < 60) return n - 57 + closeSquareBracket
    return n - 60 + a
  }

  return boundEncoder(puidEncoder, 90)
}
