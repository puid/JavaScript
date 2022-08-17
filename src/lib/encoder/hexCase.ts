import { PuidEncoder } from "../../types/puid"

export default (uppercase = false): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0) - 10

  return (n: number) => n + (n < 10 ? decimal : alpha)
}
