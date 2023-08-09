import { PuidEncoder } from '../../types/puid'

// n: 012 3456 7 8 901 2 34 567 8 9 0 123 4 567 890 1
// c: 234 6789 b d fgh j mn pqr t B D FGH J LMN PQR T

export default (): PuidEncoder => {
  const two = '2'.charCodeAt(0)
  const six = '6'.charCodeAt(0)
  const b = 'b'.charCodeAt(0)
  const d = 'd'.charCodeAt(0)
  const f = 'f'.charCodeAt(0)
  const j = 'j'.charCodeAt(0)
  const m = 'm'.charCodeAt(0)
  const p = 'p'.charCodeAt(0)
  const t = 't'.charCodeAt(0)
  const B = 'B'.charCodeAt(0)
  const D = 'D'.charCodeAt(0)
  const F = 'F'.charCodeAt(0)
  const J = 'J'.charCodeAt(0)
  const L = 'L'.charCodeAt(0)
  const P = 'P'.charCodeAt(0)
  const T = 'T'.charCodeAt(0)

  return (n: number) => {
    if (n < 3) return n + two
    if (n < 7) return n - 3 + six
    if (n === 7) return b
    if (n === 8) return d
    if (n < 12) return n - 9 + f
    if (n === 12) return j
    if (n < 15) return n - 13 + m
    if (n < 18) return n - 15 + p
    if (n === 18) return t
    if (n === 19) return B
    if (n === 20) return D
    if (n < 24) return n - 21 + F
    if (n === 24) return J
    if (n < 28) return n - 25 + L
    if (n < 31) return n - 28 + P
    if (n === 31) return T
    return NaN
  }
}
