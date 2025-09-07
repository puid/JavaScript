import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: 023456789acdefghjklmnpqrstuvwxyz
export default (): PuidEncoder => {
  const zero = '0'.charCodeAt(0)
  const two = '2'.charCodeAt(0)
  const a = 'a'.charCodeAt(0)
  const c = 'c'.charCodeAt(0)
  const j = 'j'.charCodeAt(0)
  const nChar = 'n'.charCodeAt(0)
  const p = 'p'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n === 0) return zero
    if (n < 9) return n - 1 + two // 1..8 -> '2'..'9'
    if (n === 9) return a
    if (n < 16) return n - 10 + c // 10..15 -> 'c'..'h'
    if (n < 20) return n - 16 + j // 16..19 -> 'j'..'m'
    if (n === 20) return nChar
    return n - 21 + p // 21..31 -> 'p'..'z'
  }

  return boundEncoder(puidEncoder, 32)
}
