import { PuidEncoder } from "../../types/puid"

export default (chars: string): PuidEncoder => {
  const charCodes = chars.split('').map((c) => c.charCodeAt(0))
  return (n: number) => charCodes[n]
}
