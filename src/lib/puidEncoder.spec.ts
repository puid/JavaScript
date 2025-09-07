import test, { ExecutionContext } from 'ava'

import { Chars } from './chars'
import hexCaseEncoder from './encoder/hexCase'
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
test('base36 (digits-first) encoder chars', (t) => charsEncoder(t, Chars.Base36))
test('base36 upper (digits-first) encoder chars', (t) => charsEncoder(t, Chars.Base36Upper))
test('base45 encoder chars', (t) => charsEncoder(t, Chars.Base45))
test('base58 encoder chars', (t) => charsEncoder(t, Chars.Base58))
test('base85 encoder chars', (t) => charsEncoder(t, Chars.Base85))
test('bech32 encoder chars', (t) => charsEncoder(t, Chars.Bech32))
test('boolean encoder chars', (t) => charsEncoder(t, Chars.Boolean))
test('dna encoder chars', (t) => charsEncoder(t, Chars.Dna))
test('geohash encoder chars', (t) => charsEncoder(t, Chars.Geohash))
test('urlSafe encoder chars', (t) => charsEncoder(t, Chars.UrlSafe))
test('crockford32() encoder chars', (t) => charsEncoder(t, Chars.Crockford32))
test('decimalEncoder() encoder chars', (t) => charsEncoder(t, Chars.Decimal))
test('hexCaseEncoder() encoder chars', (t) => charsEncoder(t, Chars.Hex))
test('hexCaseEncoder(true) encoder chars', (t) => {
  const testEncoder = hexCaseEncoder(true)
  t.is(testEncoder(0), '0'.charCodeAt(0))  // '0'
  t.is(testEncoder(9), '9'.charCodeAt(0))  // '9'
  t.is(testEncoder(10), 'A'.charCodeAt(0)) // 'A' (uppercase)
  t.is(testEncoder(15), 'F'.charCodeAt(0)) // 'F' (uppercase)
  t.is(testEncoder(-1), NaN)
  t.is(testEncoder(16), NaN)
})
test('safeAsciiEncoder() encoder chars', (t) => charsEncoder(t, Chars.SafeAscii))
test('safe32Encoder() encoder chars', (t) => charsEncoder(t, Chars.Safe32))
test('safe64Encoder encoder chars', (t) => charsEncoder(t, Chars.Safe64))
test('symbolEncoder() encoder chars', (t) => charsEncoder(t, Chars.Symbol))
test('wordSafe32Encoder() encoder chars', (t) => charsEncoder(t, Chars.WordSafe32))
test('zBase32Encoder() encoder chars', (t) => charsEncoder(t, Chars.ZBase32))
