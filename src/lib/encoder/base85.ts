import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstu
export default (): PuidEncoder => {
  const bang = '!'.charCodeAt(0)           // 33
  const openParen = '('.charCodeAt(0)      // 40
  const zero = '0'.charCodeAt(0)           // 48
  const colon = ':'.charCodeAt(0)          // 58
  const A = 'A'.charCodeAt(0)              // 65
  const openSquare = '['.charCodeAt(0)     // 91
  const a = 'a'.charCodeAt(0)              // 97

  const puidEncoder = (n: number) => {
    if (n < 7) return n + bang             // '!'.."'"
    if (n < 15) return n - 7 + openParen   // '('..'/'
    if (n < 25) return n - 15 + zero       // '0'..'9'
    if (n < 32) return n - 25 + colon      // ':'..'@'
    if (n < 58) return n - 32 + A          // 'A'..'Z'
    if (n < 64) return n - 58 + openSquare // '['..'`'
    return n - 64 + a                      // 'a'..'u'
  }

  return boundEncoder(puidEncoder, 85)
}
