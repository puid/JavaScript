import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:
export default (): PuidEncoder => {
  const zero = '0'.charCodeAt(0)
  const A = 'A'.charCodeAt(0)
  const space = ' '.charCodeAt(0)
  const dollar = '$'.charCodeAt(0)
  const percent = '%'.charCodeAt(0)
  const star = '*'.charCodeAt(0)
  const plus = '+'.charCodeAt(0)
  const minus = '-'.charCodeAt(0)
  const dot = '.'.charCodeAt(0)
  const slash = '/'.charCodeAt(0)
  const colon = ':'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n < 10) return n + zero
    if (n < 36) return n - 10 + A
    if (n === 36) return space
    if (n === 37) return dollar
    if (n === 38) return percent
    if (n === 39) return star
    if (n === 40) return plus
    if (n === 41) return minus
    if (n === 42) return dot
    if (n === 43) return slash
    return colon
  }

  return boundEncoder(puidEncoder, 45)
}
