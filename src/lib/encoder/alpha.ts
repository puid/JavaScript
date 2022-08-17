import { PuidEncoder } from "../../types/puid"

export default (): PuidEncoder => {
  const upper = 'A'.charCodeAt(0)
  const lower = 'a'.charCodeAt(0) - 26

  return (n: number) => n + (n < 26 ? upper : lower)
}
