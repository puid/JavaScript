import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

export default (): PuidEncoder => {
  const upper = 'A'.charCodeAt(0)
  const lower = 'a'.charCodeAt(0)
  const decimal = '0'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 26) return n + upper
    if (n < 52) return n - 26 + lower
    return n - 52 + decimal
  }

  return boundEncoder(puidEncoder, 62)
}
