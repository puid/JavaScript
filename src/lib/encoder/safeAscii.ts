export default (): PuidEncoder => {
  const bang = '!'.charCodeAt(0)
  const ampersand = '&'.charCodeAt(0) - 4
  const openSquareBracket = '['.charCodeAt(0) - 56
  const underscore = '_'.charCodeAt(0) - 59
  const a = 'a'.charCodeAt(0) - 60
  const tilde = '~'.charCodeAt(0)

  return (n: number) => {
    if (n === 0) return bang
    if (n < 5) return n + ampersand
    if (n < 57) return n + openSquareBracket
    if (n < 60) return n + underscore
    if (n < 89) return n + a
    return tilde
  }
}
