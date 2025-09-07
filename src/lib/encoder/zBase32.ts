import { PuidEncoder } from '../../types/puid'

import boundEncoder from './boundEncoder'

// chars: ybndrfg8ejkmcpqxot1uwisza345h769 (z-base-32)
export default (): PuidEncoder => {
  const y = 'y'.charCodeAt(0)
  const b = 'b'.charCodeAt(0)
  const nChar = 'n'.charCodeAt(0)
  const d = 'd'.charCodeAt(0)
  const r = 'r'.charCodeAt(0)
  const f = 'f'.charCodeAt(0)
  const g = 'g'.charCodeAt(0)
  const eight = '8'.charCodeAt(0)
  const e = 'e'.charCodeAt(0)
  const j = 'j'.charCodeAt(0)
  const m = 'm'.charCodeAt(0)
  const c = 'c'.charCodeAt(0)
  const p = 'p'.charCodeAt(0)
  const q = 'q'.charCodeAt(0)
  const x = 'x'.charCodeAt(0)
  const o = 'o'.charCodeAt(0)
  const t = 't'.charCodeAt(0)
  const one = '1'.charCodeAt(0)
  const u = 'u'.charCodeAt(0)
  const w = 'w'.charCodeAt(0)
  const i = 'i'.charCodeAt(0)
  const s = 's'.charCodeAt(0)
  const z = 'z'.charCodeAt(0)
  const a = 'a'.charCodeAt(0)
  const three = '3'.charCodeAt(0)
  const h = 'h'.charCodeAt(0)
  const seven = '7'.charCodeAt(0)
  const six = '6'.charCodeAt(0)
  const nine = '9'.charCodeAt(0)

  const puidEncoder = (n: number) => {
    if (n === 0) return y
    if (n === 1) return b
    if (n === 2) return nChar
    if (n === 3) return d
    if (n === 4) return r
    if (n === 5) return f
    if (n === 6) return g
    if (n === 7) return eight
    if (n === 8) return e
    if (n < 11) return n - 9 + j // 9..10 -> 'j'..'k'
    if (n === 11) return m
    if (n === 12) return c
    if (n === 13) return p
    if (n === 14) return q
    if (n === 15) return x
    if (n === 16) return o
    if (n === 17) return t
    if (n === 18) return one
    if (n === 19) return u
    if (n === 20) return w
    if (n === 21) return i
    if (n === 22) return s
    if (n === 23) return z
    if (n === 24) return a
    if (n < 28) return n - 25 + three // 25..27 -> '3'..'5'
    if (n === 28) return h
    if (n === 29) return seven
    if (n === 30) return six
    return nine // 31
  }

  return boundEncoder(puidEncoder, 32)
}
