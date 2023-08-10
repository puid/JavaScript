import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

export default (): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = 'A'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + decimal
    return n - 10 + alpha
  }

  return boundEncoder(puidEncoder, 16)
}
