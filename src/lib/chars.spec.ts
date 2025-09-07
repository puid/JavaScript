import test from 'ava'

import { byteLength, Chars, metrics, validChars } from './chars'

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
    Chars.Base36,
    Chars.Base36Upper,
    Chars.Base45,
    Chars.Base58,
    Chars.Base85,
    Chars.Bech32,
    Chars.Boolean,
    Chars.Crockford32,
    Chars.Decimal,
    Chars.Dna,
    Chars.Geohash,
    Chars.Hex,
    Chars.HexUpper,
    Chars.SafeAscii,
    Chars.Safe32,
    Chars.Safe64,
    Chars.Symbol,
    Chars.UrlSafe,
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

// Fail-fast byteLength when no Buffer.byteLength and no TextEncoder

test.serial('byteLength throws when no global Buffer.byteLength or TextEncoder', (t) => {
  const g: any = globalThis as any
  const oldBuffer = g.Buffer
  const oldTextEncoder = g.TextEncoder
  try {
    g.Buffer = undefined
    delete g.TextEncoder
    const err = t.throws(() => byteLength('a'))
    t.is(err?.message, 'No byte-length implementation available')
  } finally {
    g.Buffer = oldBuffer
    if (oldTextEncoder) g.TextEncoder = oldTextEncoder
  }
})

// ETE (Entropy Transform Efficiency) Tests

test('metrics returns correct structure', (t) => {
  const hexMetrics = metrics(Chars.Hex)
  t.truthy(hexMetrics.avgBits)
  t.truthy(hexMetrics.bitShifts)
  t.truthy(hexMetrics.ere)
  t.truthy(hexMetrics.ete)
  t.is(typeof hexMetrics.avgBits, 'number')
  t.is(typeof hexMetrics.ere, 'number')
  t.is(typeof hexMetrics.ete, 'number')
  t.true(Array.isArray(hexMetrics.bitShifts))
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
    const charsetMetrics = metrics(chars)
    t.is(chars.length, size, `${size} char charset should have ${size} chars`)
    t.is(charsetMetrics.ete, 1.0, `${size} char charset should have ETE = 1.0`)
    t.is(charsetMetrics.avgBits, Math.ceil(Math.log2(size)), `${size} char charset avgBits should equal bits per char`)
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
    const charsetMetrics = metrics(chars)
    t.true(charsetMetrics.ete > 0, `${chars.length} char charset ETE should be > 0`)
    t.true(charsetMetrics.ete < 1.0, `${chars.length} char charset ETE should be < 1.0`)
    t.true(
      charsetMetrics.avgBits > Math.log2(chars.length),
      `${chars.length} char charset avgBits should be > theoretical bits`
    )
  })
})

test('specific ETE values match expected ranges', (t) => {
  // Test specific charsets against expected ETE values
  // These are based on the actual algorithm results

  const alphaMetrics = metrics(Chars.Alpha) // 52 chars
  t.true(
    alphaMetrics.ete > 0.84 && alphaMetrics.ete < 0.85,
    `Alpha (52 chars) ETE should be ~0.842, got ${alphaMetrics.ete}`
  )

  const alphaLowerMetrics = metrics(Chars.AlphaLower) // 26 chars
  t.true(
    alphaLowerMetrics.ete > 0.81 && alphaLowerMetrics.ete < 0.82,
    `AlphaLower (26 chars) ETE should be ~0.815, got ${alphaLowerMetrics.ete}`
  )

  const alphaNumMetrics = metrics(Chars.AlphaNum) // 62 chars
  t.true(
    alphaNumMetrics.ete > 0.96 && alphaNumMetrics.ete < 0.97,
    `AlphaNum (62 chars) ETE should be ~0.966, got ${alphaNumMetrics.ete}`
  )

  const alphaNumLowerMetrics = metrics(Chars.AlphaNumLower) // 36 chars
  t.true(
    alphaNumLowerMetrics.ete > 0.64 && alphaNumLowerMetrics.ete < 0.65,
    `AlphaNumLower (36 chars) ETE should be ~0.646, got ${alphaNumLowerMetrics.ete}`
  )

  const decimalMetrics = metrics(Chars.Decimal) // 10 chars
  t.true(
    decimalMetrics.ete > 0.61 && decimalMetrics.ete < 0.62,
    `Decimal (10 chars) ETE should be ~0.615, got ${decimalMetrics.ete}`
  )

  const safeAsciiMetrics = metrics(Chars.SafeAscii) // 90 chars
  t.true(
    safeAsciiMetrics.ete > 0.8 && safeAsciiMetrics.ete < 0.81,
    `SafeAscii (90 chars) ETE should be ~0.805, got ${safeAsciiMetrics.ete}`
  )
})

test('bit shifts are calculated correctly for metrics', (t) => {
  // Power-of-2 should have single bit shift
  const hexMetrics = metrics(Chars.Hex)
  t.is(hexMetrics.bitShifts.length, 1)
  t.deepEqual(hexMetrics.bitShifts[0], [15, 4])

  const safe64Metrics = metrics(Chars.Safe64)
  t.is(safe64Metrics.bitShifts.length, 1)
  t.deepEqual(safe64Metrics.bitShifts[0], [63, 6])

  // Non-power-of-2 should have multiple bit shifts
  const alphaMetrics = metrics(Chars.Alpha) // 52 chars
  t.true(alphaMetrics.bitShifts.length > 1)
  t.deepEqual(alphaMetrics.bitShifts[0], [51, 6]) // Base value

  const decimalMetrics = metrics(Chars.Decimal) // 10 chars
  t.true(decimalMetrics.bitShifts.length > 1)
  t.deepEqual(decimalMetrics.bitShifts[0], [9, 4]) // Base value
})

test('avgBits calculates correctly', (t) => {
  // Power-of-2 charsets
  t.is(metrics(Chars.Hex).avgBits, 4)
  t.is(metrics(Chars.Base32).avgBits, 5)
  t.is(metrics(Chars.Safe64).avgBits, 6)

  // Non-power-of-2 charsets should have higher avgBits than theoretical
  const decimal = Chars.Decimal // 10 chars
  const decimalMetrics = metrics(decimal)
  const decimalTheoretical = Math.log2(10)
  t.true(decimalMetrics.avgBits > decimalTheoretical)
  t.true(decimalMetrics.avgBits > 5) // Actually 5.4 due to rejection

  const alpha = Chars.Alpha // 52 chars
  const alphaMetrics = metrics(alpha)
  const alphaTheoretical = Math.log2(52)
  t.true(alphaMetrics.avgBits > alphaTheoretical)
  t.true(alphaMetrics.avgBits > 6) // Actually 6.77 due to rejection
})

test('ete returns correct values', (t) => {
  t.is(metrics(Chars.Safe64).ete, 1.0)
  t.is(metrics(Chars.Hex).ete, 1.0)

  const alphaMetrics = metrics(Chars.Alpha)
  t.true(alphaMetrics.ete > 0.84 && alphaMetrics.ete < 0.85)

  const decimalMetrics = metrics(Chars.Decimal)
  t.true(decimalMetrics.ete > 0.61 && decimalMetrics.ete < 0.62)
})

test('custom charset ETE calculation', (t) => {
  // Test with custom charsets
  const customPow2 = 'dingosky' // 8 chars (power of 2)
  const customPow2Metrics = metrics(customPow2)
  t.is(customPow2Metrics.ete, 1.0)
  t.is(customPow2Metrics.avgBits, 3)

  const custom10 = 'dingoskyme' // 10 chars (non-power of 2)
  const custom10Metrics = metrics(custom10)
  t.true(custom10Metrics.ete > 0 && custom10Metrics.ete < 1.0)
  t.true(custom10Metrics.avgBits > Math.log2(10))
})

test('ERE calculation is reasonable', (t) => {
  // ERE should be between 0 and 1 for all charsets
  const charsets = [Chars.Alpha, Chars.AlphaNum, Chars.Hex, Chars.Safe64, Chars.Decimal, Chars.SafeAscii]

  charsets.forEach((chars) => {
    const charsetMetrics = metrics(chars)
    t.true(charsetMetrics.ere > 0, `ERE should be positive for ${chars.length} char charset`)
    t.true(charsetMetrics.ere <= 1.0, `ERE should be <= 1.0 for ${chars.length} char charset`)
  })
})

test('metrics are consistent across multiple calls', (t) => {
  const chars = Chars.AlphaNum
  const alphaNumMetrics1 = metrics(chars)
  const alphaNumMetrics2 = metrics(chars)

  t.deepEqual(alphaNumMetrics1, alphaNumMetrics2, 'Metrics should be identical for same charset')
})

test('odd vs even sized charsets', (t) => {
  // Test that odd-sized charsets are handled correctly
  const odd9 = 'abcdefghi' // 9 chars (odd)
  const odd9Metrics = metrics(odd9)
  t.true(odd9Metrics.ete > 0 && odd9Metrics.ete < 1.0)
  t.is(odd9Metrics.bitShifts[0]?.[0], 9) // Base value should be 9 for odd

  const even10 = 'abcdefghij' // 10 chars (even)
  const even10Metrics = metrics(even10)
  t.true(even10Metrics.ete > 0 && even10Metrics.ete < 1.0)
  t.is(even10Metrics.bitShifts[0]?.[0], 9) // Base value should be 9 (10-1) for even
})

test('boundary cases for ETE', (t) => {
  // Minimum charset (2 chars - power of 2)
  const min2 = 'ab'
  const min2Metrics = metrics(min2)
  t.is(min2Metrics.ete, 1.0)
  t.is(min2Metrics.avgBits, 1)

  // 3 chars (non-power of 2)
  const three = 'abc'
  const threeMetrics = metrics(three)
  t.true(threeMetrics.ete > 0 && threeMetrics.ete < 1.0)
  t.true(threeMetrics.avgBits > Math.log2(3))

  // Large charset close to power of 2
  const chars63 = Chars.AlphaNum + '-' // 63 chars (one less than 64)
  const chars63Metrics = metrics(chars63)
  t.true(
    chars63Metrics.ete > 0.98 && chars63Metrics.ete < 1.0,
    `63 chars should have high ETE, got ${chars63Metrics.ete}`
  )
})
