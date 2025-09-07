import test from 'ava'

import { Chars, validChars, charMetrics, entropyTransformEfficiency, avgBitsPerChar } from './chars'

test('pre-defined Chars', (t) => {
  const allChars = [
    Chars.Alpha,
    Chars.AlphaLower,
    Chars.AlphaNum,
    Chars.AlphaNumLower,
    Chars.AlphaNumUpper,
    Chars.AlphaUpper,
    Chars.Base16,
    Chars.Base32,
    Chars.Base32Hex,
    Chars.Base32HexUpper,
    Chars.Crockford32,
    Chars.Decimal,
    Chars.Hex,
    Chars.HexUpper,
    Chars.SafeAscii,
    Chars.Safe32,
    Chars.Safe64,
    Chars.WordSafe32
  ]

  allChars.forEach((chars) => t.is(validChars(chars)[0], true))
})

const invalidChars = (chars: string) => validChars(chars)[1]

test('valid custom characters', (t) => t.is(validChars('dingosky')[0], true))

test('invalid characters', (t) => {
  t.regex(invalidChars('dingo sky'), /Invalid/)
  t.regex(invalidChars('dingo sky'), /Invalid/)
  t.regex(invalidChars('dingo"sky'), /Invalid/)
  t.regex(invalidChars("dingo'sky"), /Invalid/)
  t.regex(invalidChars('dingo\\sky'), /Invalid/)
  t.regex(invalidChars('dingo`sky'), /Invalid/)
  t.regex(invalidChars('dingo\u0088sky'), /Invalid/)
  t.regex(invalidChars('dîngøsky:🐕'), /Invalid/)
})

test('non-unique character', (t) => t.regex(invalidChars('unique'), /not unique/))

test('too few custom characters', (t) => {
  t.regex(invalidChars(''), /at least/)
  t.regex(invalidChars('1'), /at least/)
})

test('too many custom characters', (t) => {
  const tooMany = new Array(257).fill('a').toString()
  t.regex(invalidChars(tooMany), /greater/)
})

// ETE (Entropy Transform Efficiency) Tests

test('charMetrics returns correct structure', (t) => {
  const metrics = charMetrics(Chars.Hex)
  t.truthy(metrics.avgBits)
  t.truthy(metrics.bitShifts)
  t.truthy(metrics.ere)
  t.truthy(metrics.ete)
  t.is(typeof metrics.avgBits, 'number')
  t.is(typeof metrics.ere, 'number')
  t.is(typeof metrics.ete, 'number')
  t.true(Array.isArray(metrics.bitShifts))
})

test('power-of-2 charsets have ETE = 1.0', (t) => {
  // Test all power-of-2 charsets
  const powerOf2Charsets = [
    { chars: Chars.Hex, size: 16 },
    { chars: Chars.HexUpper, size: 16 },
    { chars: Chars.Base32, size: 32 },
    { chars: Chars.Base32Hex, size: 32 },
    { chars: Chars.Base32HexUpper, size: 32 },
    { chars: Chars.Crockford32, size: 32 },
    { chars: Chars.Safe32, size: 32 },
    { chars: Chars.WordSafe32, size: 32 },
    { chars: Chars.Safe64, size: 64 }
  ]

  powerOf2Charsets.forEach(({ chars, size }) => {
    const metrics = charMetrics(chars)
    t.is(chars.length, size, `${size} char charset should have ${size} chars`)
    t.is(metrics.ete, 1.0, `${size} char charset should have ETE = 1.0`)
    t.is(metrics.avgBits, Math.ceil(Math.log2(size)), `${size} char charset avgBits should equal bits per char`)
  })
})

test('non-power-of-2 charsets have ETE < 1.0', (t) => {
  const nonPowerOf2Charsets = [
    Chars.Alpha,
    Chars.AlphaLower,
    Chars.AlphaUpper,
    Chars.AlphaNum,
    Chars.AlphaNumLower,
    Chars.AlphaNumUpper,
    Chars.Decimal,
    Chars.Symbol,
    Chars.SafeAscii
  ]

  nonPowerOf2Charsets.forEach((chars) => {
    const metrics = charMetrics(chars)
    t.true(metrics.ete > 0, `${chars.length} char charset ETE should be > 0`)
    t.true(metrics.ete < 1.0, `${chars.length} char charset ETE should be < 1.0`)
    t.true(metrics.avgBits > Math.log2(chars.length), `${chars.length} char charset avgBits should be > theoretical bits`)
  })
})

test('specific ETE values match expected ranges', (t) => {
  // Test specific charsets against expected ETE values
  // These are based on the actual algorithm results
  
  const metrics52 = charMetrics(Chars.Alpha) // 52 chars
  t.true(metrics52.ete > 0.84 && metrics52.ete < 0.85, `Alpha (52 chars) ETE should be ~0.842, got ${metrics52.ete}`)
  
  const metrics26 = charMetrics(Chars.AlphaLower) // 26 chars
  t.true(metrics26.ete > 0.81 && metrics26.ete < 0.82, `AlphaLower (26 chars) ETE should be ~0.815, got ${metrics26.ete}`)
  
  const metrics62 = charMetrics(Chars.AlphaNum) // 62 chars
  t.true(metrics62.ete > 0.96 && metrics62.ete < 0.97, `AlphaNum (62 chars) ETE should be ~0.966, got ${metrics62.ete}`)
  
  const metrics36 = charMetrics(Chars.AlphaNumLower) // 36 chars
  t.true(metrics36.ete > 0.64 && metrics36.ete < 0.65, `AlphaNumLower (36 chars) ETE should be ~0.646, got ${metrics36.ete}`)
  
  const metrics10 = charMetrics(Chars.Decimal) // 10 chars
  t.true(metrics10.ete > 0.61 && metrics10.ete < 0.62, `Decimal (10 chars) ETE should be ~0.615, got ${metrics10.ete}`)
  
  const metrics90 = charMetrics(Chars.SafeAscii) // 90 chars
  t.true(metrics90.ete > 0.80 && metrics90.ete < 0.81, `SafeAscii (90 chars) ETE should be ~0.805, got ${metrics90.ete}`)
})

test('bit shifts are calculated correctly for charMetrics', (t) => {
  // Power-of-2 should have single bit shift
  const hex = charMetrics(Chars.Hex)
  t.is(hex.bitShifts.length, 1)
  t.deepEqual(hex.bitShifts[0], [15, 4])
  
  const safe64 = charMetrics(Chars.Safe64)
  t.is(safe64.bitShifts.length, 1)
  t.deepEqual(safe64.bitShifts[0], [63, 6])
  
  // Non-power-of-2 should have multiple bit shifts
  const alpha = charMetrics(Chars.Alpha) // 52 chars
  t.true(alpha.bitShifts.length > 1)
  t.deepEqual(alpha.bitShifts[0], [51, 6]) // Base value
  
  const decimal = charMetrics(Chars.Decimal) // 10 chars
  t.true(decimal.bitShifts.length > 1)
  t.deepEqual(decimal.bitShifts[0], [9, 4]) // Base value
})

test('avgBitsPerChar calculates correctly', (t) => {
  // Power-of-2 charsets
  t.is(avgBitsPerChar(Chars.Hex), 4)
  t.is(avgBitsPerChar(Chars.Base32), 5)
  t.is(avgBitsPerChar(Chars.Safe64), 6)
  
  // Non-power-of-2 charsets should have higher avgBits than theoretical
  const decimal = Chars.Decimal // 10 chars
  const decimalAvg = avgBitsPerChar(decimal)
  const decimalTheoretical = Math.log2(10)
  t.true(decimalAvg > decimalTheoretical)
  t.true(decimalAvg > 5) // Actually 5.4 due to rejection
  
  const alpha = Chars.Alpha // 52 chars
  const alphaAvg = avgBitsPerChar(alpha)
  const alphaTheoretical = Math.log2(52)
  t.true(alphaAvg > alphaTheoretical)
  t.true(alphaAvg > 6) // Actually 6.77 due to rejection
})

test('entropyTransformEfficiency returns correct values', (t) => {
  t.is(entropyTransformEfficiency(Chars.Safe64), 1.0)
  t.is(entropyTransformEfficiency(Chars.Hex), 1.0)
  
  const alphaEte = entropyTransformEfficiency(Chars.Alpha)
  t.true(alphaEte > 0.84 && alphaEte < 0.85)
  
  const decimalEte = entropyTransformEfficiency(Chars.Decimal)
  t.true(decimalEte > 0.61 && decimalEte < 0.62)
})

test('custom charset ETE calculation', (t) => {
  // Test with custom charsets
  const customPow2 = 'dingosky' // 8 chars (power of 2)
  const metrics8 = charMetrics(customPow2)
  t.is(metrics8.ete, 1.0)
  t.is(metrics8.avgBits, 3)
  
  const custom10 = 'dingoskyab' // 10 chars (non-power of 2)
  const metrics10 = charMetrics(custom10)
  t.true(metrics10.ete > 0 && metrics10.ete < 1.0)
  t.true(metrics10.avgBits > Math.log2(10))
})

test('ERE calculation is reasonable', (t) => {
  // ERE should be between 0 and 1 for all charsets
  const charsets = [
    Chars.Alpha,
    Chars.AlphaNum,
    Chars.Hex,
    Chars.Safe64,
    Chars.Decimal,
    Chars.SafeAscii
  ]
  
  charsets.forEach((chars) => {
    const metrics = charMetrics(chars)
    t.true(metrics.ere > 0, `ERE should be positive for ${chars.length} char charset`)
    t.true(metrics.ere <= 1.0, `ERE should be <= 1.0 for ${chars.length} char charset`)
  })
})

test('metrics are consistent across multiple calls', (t) => {
  const chars = Chars.AlphaNum
  const metrics1 = charMetrics(chars)
  const metrics2 = charMetrics(chars)
  
  t.deepEqual(metrics1, metrics2, 'Metrics should be identical for same charset')
})

test('odd vs even sized charsets', (t) => {
  // Test that odd-sized charsets are handled correctly
  const odd9 = 'abcdefghi' // 9 chars (odd)
  const metricsOdd = charMetrics(odd9)
  t.true(metricsOdd.ete > 0 && metricsOdd.ete < 1.0)
  t.is(metricsOdd.bitShifts[0]?.[0], 9) // Base value should be 9 for odd
  
  const even10 = 'abcdefghij' // 10 chars (even)
  const metricsEven = charMetrics(even10)
  t.true(metricsEven.ete > 0 && metricsEven.ete < 1.0)
  t.is(metricsEven.bitShifts[0]?.[0], 9) // Base value should be 9 (10-1) for even
})

test('boundary cases for ETE', (t) => {
  // Minimum charset (2 chars - power of 2)
  const min2 = 'ab'
  const metricsMin = charMetrics(min2)
  t.is(metricsMin.ete, 1.0)
  t.is(metricsMin.avgBits, 1)
  
  // 3 chars (non-power of 2)
  const three = 'abc'
  const metrics3 = charMetrics(three)
  t.true(metrics3.ete > 0 && metrics3.ete < 1.0)
  t.true(metrics3.avgBits > Math.log2(3))
  
  // Large charset close to power of 2
  const chars63 = Chars.AlphaNum + '-' // 63 chars (one less than 64)
  const metrics63 = charMetrics(chars63)
  t.true(metrics63.ete > 0.98 && metrics63.ete < 1.0, `63 chars should have high ETE, got ${metrics63.ete}`)
})
