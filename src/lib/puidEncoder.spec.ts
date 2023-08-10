import test, { ExecutionContext } from 'ava'

import { Chars } from './chars'
import puidEncoder from './puidEncoder'

const charsEncoder = (t: ExecutionContext, chars: string) => {
  const testEncoder = puidEncoder(chars)
  const codes = [...Array(chars.length).keys()].map((code) => testEncoder(code))
  const encoded = String.fromCharCode(...codes)
  t.is(encoded, chars)

  t.is(testEncoder(-1), NaN)
  t.is(testEncoder(codes.length), NaN)
}

test('alpha() encoder chars', (t) => charsEncoder(t, Chars.Alpha))
test('alphaCase() encoder chars', (t) => charsEncoder(t, Chars.AlphaLower))
test('alphaCase(true) encoder chars', (t) => charsEncoder(t, Chars.AlphaUpper))
test('alphaNumEncoder() encoder chars', (t) => charsEncoder(t, Chars.AlphaNum))
test('alphaNumCaseEncoder() encoder chars', (t) => charsEncoder(t, Chars.AlphaNumLower))
test('alphaNumCaseEncoder(true) encoder chars', (t) => charsEncoder(t, Chars.AlphaNumUpper))
test('base16Encoder() encoder chars', (t) => charsEncoder(t, Chars.Base16))
test('base32Encoder() encoder chars', (t) => charsEncoder(t, Chars.Base32))
test('base32HexCaseEncoder() encoder chars', (t) => charsEncoder(t, Chars.Base32Hex))
test('base32HexCaseEncoder(true) encoder chars', (t) => charsEncoder(t, Chars.Base32HexUpper))
test('crockford32() encoder chars', (t) => charsEncoder(t, Chars.Crockford32))
test('decimalEncoder() encoder chars', (t) => charsEncoder(t, Chars.Decimal))
test('hexCaseEncoder() encoder chars', (t) => charsEncoder(t, Chars.Hex))
test('hexCaseEncoder(true) encoder chars', (t) => charsEncoder(t, Chars.HexUpper))
test('safeAsciiEncoder() encoder chars', (t) => charsEncoder(t, Chars.SafeAscii))
test('safe32Encoder() encoder chars', (t) => charsEncoder(t, Chars.Safe32))
test('safe64Encoder encoder chars', (t) => charsEncoder(t, Chars.Safe64))
test('symbolEncoder() encoder chars', (t) => charsEncoder(t, Chars.Symbol))
test('wordSafe32Encoder() encoder chars', (t) => charsEncoder(t, Chars.WordSafe32))
