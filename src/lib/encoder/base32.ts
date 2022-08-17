import { PuidEncoder } from "../../types/puid"

export default (): PuidEncoder => {
  const decimal = '2'.charCodeAt(0)
  const alpha = 'A'.charCodeAt(0) - 6

  return (n: number) => n + (n < 6 ? decimal : alpha)
}
