import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

export default (): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)

  const puidEncoder = (n: number) => n + decimal

  return boundEncoder(puidEncoder, 10)
}
