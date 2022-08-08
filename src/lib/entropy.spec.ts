import { Chars } from './chars'
import { bitsForLen, entropyBits, entropyBitsPerChar, lenForBits } from './entropy'

import test, { ExecutionContext } from 'ava'

const round2 = (f: number): number => Math.round(f * 100) / 100

test('total 0 is 0', (t) => {
  t.is(entropyBits(0, 0), 0)
  t.is(entropyBits(0, 100), 0)
  t.is(entropyBits(0, 1.0e12), 0)
})

test('risk 0 is 0', (t) => {
  t.is(entropyBits(100, 0), 0)
  t.is(entropyBits(100000, 0), 0)
})

test('total 1 is 0', (t) => {
  t.is(entropyBits(1, 0), 0)
  t.is(entropyBits(1, 100), 0)
  t.is(entropyBits(1, 1.0e12), 0)
})

test('risk 1 is 0', (t) => {
  t.is(entropyBits(100, 1), 0)
  t.is(entropyBits(100000, 1), 0)
})

const totalRiskIs = (t: ExecutionContext, total: number, risk: number, expect: number) =>
  t.is(round2(entropyBits(total, risk)), expect)

test('total/risk entropy', (t) => {
  totalRiskIs(t, 100, 100, 18.92)
  totalRiskIs(t, 999, 1000, 28.89)
  totalRiskIs(t, 1000, 1000, 28.9)
  totalRiskIs(t, 10000, 1000, 35.54)
  totalRiskIs(t, 1.0e4, 1.0e3, 35.54)
  totalRiskIs(t, 100000, 1e12, 72.08)
  totalRiskIs(t, 10.0e9, 1.0e21, 135.2)
})

test('bits per char', (t) => {
  t.is(entropyBitsPerChar('dingosky'), 3.0)
  t.is(round2(entropyBitsPerChar(Chars.AlphaNum)), 5.95)
})

test('bits for len', (t) => {
  t.is(bitsForLen('dingosky', 12), 36)
  t.is(bitsForLen(Chars.SafeAscii, 15), 97)
})

test('len for bits', (t) => {
  t.is(lenForBits('dingoskyme', 50), 16)
  t.is(lenForBits(Chars.Base32Hex, 62), 13)
})
