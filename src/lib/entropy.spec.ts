import test, { ExecutionContext } from 'ava'

import { Chars } from './chars'
import { bitsForLen, entropyBits, entropyBitsPerChar, entropyRisk, entropyTotal, lenForBits } from './entropy'

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

test('risk for bits & total', (t) => {
  const approxRisk = (bits: number, total: number) => Math.round(entropyRisk(bits, total))
  t.is(approxRisk(96, 1.0e7), 1584563408741632)
  t.is(approxRisk(100, 10000), 2.535554755932038e22)
  t.is(approxRisk(100, 1e12), 2535301)
  t.is(approxRisk(108.62, 1e15), 997)
})

test('entropyRisk degenerate', (t) => {
  t.is(entropyRisk(0, 1000), 0)
  t.is(entropyRisk(72.08, 0), 0)
  t.is(entropyRisk(72.08, 1), 0)
})

test('entropy bits <-> risk roundtrip', (t) => {
  const cases: Array<[number, number]> = [
    [100, 100],
    [999, 1000],
    [1000, 1000],
    [10000, 1000],
    [100000, 1e12],
    [1.0e10, 1.0e21]
  ]
  for (const [total, risk] of cases) {
    const bits = entropyBits(total, risk)
    const approxRisk = entropyRisk(bits, total)
    const rel = (risk - approxRisk) / risk
    t.true(rel < 0.33, `${bits} ${total} ${risk} ${approxRisk} ${rel}`)
  }
})

test('total for bits & risk', (t) => {
  const approxTotal = (bits: number, risk: number) => Math.round(entropyTotal(bits, risk))
  t.is(approxTotal(96, 1e15), 12587944)
  t.is(approxTotal(100, 1000), 50351774551216)
  t.is(approxTotal(100, 1e12), 1592262919)
  t.is(approxTotal(108.62, 1e15), 998743722)
})

test('entropyTotal degenerate', (t) => {
  t.is(entropyTotal(0, 1e6), 0)
  t.is(entropyTotal(10, 0), 0)
  t.is(entropyTotal(10, 1), 0)
})

test('entropy bits <-> total roundtrip', (t) => {
  const cases: Array<[number, number]> = [
    [10000, 1000],
    [1.0e4, 1.0e3],
    [100000, 1e12],
    [1.0e10, 1.0e21]
  ]
  for (const [total, risk] of cases) {
    const bits = entropyBits(total, risk)
    const approxTotal = entropyTotal(bits, risk)
    const rel = (approxTotal - total) / total
    t.true(rel < 0.33, `${bits} ${risk} ${total} ${approxTotal} ${rel}`)
  }
})
