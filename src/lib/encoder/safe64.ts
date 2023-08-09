import { PuidEncoder } from '../../types/puid'

// n: 01234567890123456789012345 67890123456789012345678901 2345678901 2 3
// c: ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 - _

export default (): PuidEncoder => {
  const A = 'A'.charCodeAt(0)
  const a = 'a'.charCodeAt(0)
  const zero = '0'.charCodeAt(0)
  const hyphen = '-'.charCodeAt(0)
  const underscore = '_'.charCodeAt(0)

  return (n: number) => {
    if (n < 26) return n + A
    if (n < 52) return n - 26 + a
    if (n < 62) return n - 52 + zero
    if (n === 62) return hyphen
    if (n === 63) return underscore
    return NaN
  }
}
