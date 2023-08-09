import { PuidEncoder } from '../../types/puid'

// n: 0 1234 56789012 3456789 0 123 4567
// c: ! #$%& ()*+,-./ :;<=>?@ [ ]^_ {|}~

export default (): PuidEncoder => {
  const bang = '!'.charCodeAt(0)
  const hash = '#'.charCodeAt(0)
  const openParen = '('.charCodeAt(0)
  const colon = ':'.charCodeAt(0)
  const openSquareBracket = '['.charCodeAt(0)
  const closeSquareBracket = ']'.charCodeAt(0)
  const openCurlyBracket = '{'.charCodeAt(0)

  return (n: number) => {
    if (n === 0) return bang
    if (n < 5) return n - 1 + hash
    if (n < 13) return n - 5 + openParen
    if (n < 20) return n - 13 + colon
    if (n === 20) return openSquareBracket
    if (n < 24) return n - 21 + closeSquareBracket
    if (n < 28) return n - 24 + openCurlyBracket
    return NaN
  }
}
