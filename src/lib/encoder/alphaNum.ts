import { PuidEncoder } from "../../types/puid"

export default (): PuidEncoder => {
  const upper = 'A'.charCodeAt(0)
  const lower = 'a'.charCodeAt(0) - 26
  const decimal = '0'.charCodeAt(0) - 52

  return (n: number) => {
    if (n < 26) return n + upper
    if (n < 52) return n + lower
    return n + decimal
  }
}
