import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz

export default (): PuidEncoder => {
  const upper = 'A'.charCodeAt(0)
  const lower = 'a'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 26) return n + upper
    return n - 26 + lower
  }

  return boundEncoder(puidEncoder, 52)
}
