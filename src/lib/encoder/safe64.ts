export default (): PuidEncoder => {
  const upper = 'A'.charCodeAt(0)
  const lower = 'a'.charCodeAt(0) - 26
  const decimal = '0'.charCodeAt(0) - 52 
  const hyphen = '-'.charCodeAt(0)
  const underscore = '_'.charCodeAt(0)

  return (n: number) => {
    if (n < 26) return n + upper
    if (n < 52) return n + lower
    if (n < 62) return n + decimal
    if (n === 62) return hyphen
    return underscore
  }
}
