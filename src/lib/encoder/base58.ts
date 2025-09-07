import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
export default (): PuidEncoder => {
  const one = '1'.charCodeAt(0)
  const A = 'A'.charCodeAt(0)
  const J = 'J'.charCodeAt(0)
  const P = 'P'.charCodeAt(0)
  const a = 'a'.charCodeAt(0)
  const m = 'm'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 9) return n + one            // 0..8   -> '1'..'9'
    if (n < 17) return n - 9 + A         // 9..16  -> 'A'..'H'
    if (n < 22) return n - 17 + J        // 17..21 -> 'J'..'N' (skip 'I')
    if (n < 33) return n - 22 + P        // 22..32 -> 'P'..'Z' (skip 'O')
    if (n < 44) return n - 33 + a        // 33..43 -> 'a'..'k'
    return n - 44 + m                    // 44..57 -> 'm'..'z' (skip 'l')
  }

  return boundEncoder(puidEncoder, 58)
}
