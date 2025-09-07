import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: ACGT
export default (): PuidEncoder => {
  const A = 'A'.charCodeAt(0)
  const C = 'C'.charCodeAt(0)
  const G = 'G'.charCodeAt(0)
  const T = 'T'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n === 0) return A
    if (n === 1) return C
    if (n === 2) return G
    return T
  }

  return boundEncoder(puidEncoder, 4)
}
