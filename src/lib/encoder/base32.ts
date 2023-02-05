import { PuidEncoder } from '../../types/puid'

export default (): PuidEncoder => {
  const alpha = 'A'.charCodeAt(0)
  const decimal = '2'.charCodeAt(0) - 26

  return (n: number) => n + (n < 26 ? alpha : decimal)
}
