import { PuidEncoder } from '../../types/puid'

// n: 01234567 8 901 2 3 456 789 0 123 4 5 678 901
// c: 23456789 C FGH J M PQR VWX c fgh j m pqr vwx

export default (): PuidEncoder => {
  const two = '2'.charCodeAt(0)
  const C = 'C'.charCodeAt(0)
  const F = 'F'.charCodeAt(0)
  const J = 'J'.charCodeAt(0)
  const M = 'M'.charCodeAt(0)
  const P = 'P'.charCodeAt(0)
  const V = 'V'.charCodeAt(0)
  const c = 'c'.charCodeAt(0)
  const f = 'f'.charCodeAt(0)
  const j = 'j'.charCodeAt(0)
  const m = 'm'.charCodeAt(0)
  const p = 'p'.charCodeAt(0)
  const v = 'v'.charCodeAt(0)

  return (n: number) => {
    if (n < 8) return n + two
    if (n === 8) return C
    if (n < 12) return n - 9 + F
    if (n === 12) return J
    if (n === 13) return M
    if (n < 17) return n - 14 + P
    if (n < 20) return n - 16 + V
    if (n === 20) return c
    if (n < 24) return n - 21 + f
    if (n === 24) return j
    if (n === 25) return m
    if (n < 29) return n - 26 + p
    if (n < 32) return n - 29 + v
    return NaN
  }
}
