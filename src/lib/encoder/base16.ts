import { PuidEncoder } from '../../types/puid'

export default (): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)
  const alpha = 'A'.charCodeAt(0) - 10

  return (n: number) => n + (n < 10 ? decimal : alpha)
}
