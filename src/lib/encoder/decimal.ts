import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: 0123456789

export default (): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)

  const puidEncoder = (n: number) => n + decimal

  return boundEncoder(puidEncoder, 10)
}
