import { PuidEncoder } from "../../types/puid"

export default (): PuidEncoder => {
  const two = '2'.charCodeAt(0)
  const six = '6'.charCodeAt(0) - 3
  const b = 'b'.charCodeAt(0)
  const d = 'd'.charCodeAt(0)
  const f = 'f'.charCodeAt(0) - 9
  const j = 'j'.charCodeAt(0)
  const m = 'm'.charCodeAt(0) - 13
  const p = 'p'.charCodeAt(0) - 15
  const t = 't'.charCodeAt(0)
  const B = 'B'.charCodeAt(0)
  const D = 'D'.charCodeAt(0)
  const F = 'F'.charCodeAt(0) - 21
  const J = 'J'.charCodeAt(0)
  const L = 'L'.charCodeAt(0) - 25
  const P = 'P'.charCodeAt(0) - 28
  const T = 'T'.charCodeAt(0)

  return (n: number) => {
    if (n < 3) return n + two
    if (n < 7) return n + six
    if (n === 7) return b
    if (n === 8) return d
    if (n < 12) return n + f
    if (n === 12) return j
    if (n < 15) return n + m
    if (n < 18) return n + p
    if (n === 18) return t
    if (n === 19) return B
    if (n === 20) return D
    if (n < 24) return n + F
    if (n === 24) return J
    if (n < 28) return n + L
    if (n < 31) return n + P
    return T
  }
}
