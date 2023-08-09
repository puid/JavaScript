import { PuidEncoder } from '../../types/puid'

export default (uppercase = false): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0) - 10

  return (n: number) => {
    if (n < 10) return n + decimal
    return n + alpha
  }
}
