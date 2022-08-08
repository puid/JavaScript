import test, { ExecutionContext } from 'ava'

import { Chars } from './chars'
import encoder from './encoder'

const chars_encoder = (t: ExecutionContext, chars: string) => {
  const chars_encoder = encoder(chars)
  const codes = [...Array(chars.length).keys()].map(code => chars_encoder(code))
  const encoded = String.fromCharCode(...codes)
  t.is(encoded, chars)
}

test('alpha() encoder chars', (t) => chars_encoder(t, Chars.Alpha))  
test('alphaCase() encoder chars', (t) => chars_encoder(t, Chars.AlphaLower))
test('alphaCase(true) encoder chars', (t) => chars_encoder(t, Chars.AlphaUpper))
test('alphaNumEncoder() encoder chars', (t) => chars_encoder(t, Chars.AlphaNum))
test('alphaNumCaseEncoder() encoder chars', (t) => chars_encoder(t, Chars.AlphaNumLower))
test('alphaNumCaseEncoder(true) encoder chars', (t) => chars_encoder(t, Chars.AlphaNumUpper))
test('base32Encoder() encoder chars', (t) => chars_encoder(t, Chars.Base32))
test('base32HexCaseEncoder() encoder chars', (t) => chars_encoder(t, Chars.Base32Hex))
test('base32HexCaseEncoder(true) encoder chars', (t) => chars_encoder(t, Chars.Base32HexUpper))
test('decimalEncoder() encoder chars', (t) => chars_encoder(t, Chars.Decimal))
test('hexCaseEncoder() encoder chars', (t) => chars_encoder(t, Chars.Hex))
test('hexCaseEncoder(true) encoder chars', (t) => chars_encoder(t, Chars.HexUpper))
test('safeAsciiEncoder() encoder chars', (t) => chars_encoder(t, Chars.SafeAscii))
test('safe32Encoder() encoder chars', (t) => chars_encoder(t, Chars.Safe32))
test('safe64Encoder encoder chars', (t) => chars_encoder(t, Chars.Safe64))
test('symbolEncoder() encoder chars', (t) => chars_encoder(t, Chars.Symbol))
