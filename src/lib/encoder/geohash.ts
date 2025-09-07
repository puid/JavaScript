import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: 0123456789bcdefghjkmnpqrstuvwxyz
export default (): PuidEncoder => {
  const zero = '0'.charCodeAt(0)
  const b = 'b'.charCodeAt(0)
  const j = 'j'.charCodeAt(0)
  const m = 'm'.charCodeAt(0)
  const p = 'p'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + zero           // '0'..'9'
    if (n < 17) return n - 10 + b         // 10..16 -> 'b'..'h'
    if (n < 19) return n - 17 + j         // 17..18 -> 'j'..'k'
    if (n < 21) return n - 19 + m         // 19..20 -> 'm'..'n'
    return n - 21 + p                     // 21..31 -> 'p'..'z'
  }

  return boundEncoder(puidEncoder, 32)
}
