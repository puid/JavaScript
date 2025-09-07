import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: TF
export default (): PuidEncoder => {
  const T = 'T'.charCodeAt(0)
  const F = 'F'.charCodeAt(0)

  const puidEncoder = (n: number) => (n === 0 ? T : F)

  return boundEncoder(puidEncoder, 2)
}
