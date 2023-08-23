import { PuidEncoder } from '../../types/puid'

// Decorate encoder to return NaN for negative and out-of-bounds indexes

export default (puidEncoder: PuidEncoder, oob: number): PuidEncoder =>
  (n: number) => {
    if (n < 0) return NaN
    if (n < oob) return puidEncoder(n)
    return NaN
  }
