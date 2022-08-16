export default (): PuidEncoder => {
  const bang = '!'.charCodeAt(0)
  const hash = '#'.charCodeAt(0) - 1
  const openParen = '('.charCodeAt(0) - 5
  const colon = ':'.charCodeAt(0) - 13
  const openSquareBracket = '['.charCodeAt(0)
  const closeSquareBracket = ']'.charCodeAt(0) - 21
  const openCurlyBracket = '{'.charCodeAt(0) - 24

  return (n: number) => {
    if (n === 0) return bang
    if (n < 5) return n + hash
    if (n < 13) return n + openParen
    if (n < 20) return n + colon
    if (n === 20) return openSquareBracket
    if (n < 24) return n + closeSquareBracket
    return n + openCurlyBracket
  }
}
