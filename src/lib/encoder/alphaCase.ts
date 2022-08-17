import { PuidEncoder } from "../../types/puid"

export default (uppercase = false): PuidEncoder => {
  const alpha = (uppercase ? 'A' : 'a').charCodeAt(0)

  return (n: number) => n + alpha
}
