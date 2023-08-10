import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

export default (): PuidEncoder => {
  const alpha = 'A'.charCodeAt(0)
  const decimal = '2'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 26) return n + alpha
    return n - 26 + decimal
  }

  return boundEncoder(puidEncoder, 32)
}
