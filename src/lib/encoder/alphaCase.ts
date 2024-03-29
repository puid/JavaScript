import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars:
//   lower: abcdefghijklmnopqrstuvwxyz
//   upper: ABCDEFGHIJKLMNOPQRSTUVWXYZ

export default (uppercase = false): PuidEncoder => {
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0)

  const puidEncoder = (n: number) => n + alpha

  return boundEncoder(puidEncoder, 26)
}
