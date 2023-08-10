import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

export default (chars: string): PuidEncoder => {
  const charCodes = chars.split('').map((c) => c.charCodeAt(0))

  const puidEncoder = (n: number) => charCodes[n]

  return boundEncoder(puidEncoder, charCodes.length)
}
