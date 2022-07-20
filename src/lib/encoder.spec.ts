import test, { ExecutionContext } from 'ava'

import { Chars } from './chars'
import alphaEncoder from './encoder/alpha'
import alphaCaseEncoder from './encoder/alphaCase'
import alphaNumEncoder from './encoder/alphaNum'
import alphaNumCaseEncoder from './encoder/alphaNumCase'
import base32Encoder from './encoder/base32'
import base32HexCaseEncoder from './encoder/base32HexCase'
import decimalEncoder from './encoder/decimal'
import hexCaseEncoder from './encoder/hexCase'
import safe32Encoder from './encoder/safe32'
import safe64Encoder from './encoder/safe64'
import safeAsciiEncoder from './encoder/safeAscii'
import symbolEncoder from './encoder/symbol'

type PuidEncoder = (n: number) => number

const encoder = (t: ExecutionContext, encoder: PuidEncoder, chars: string) => {
  const codes = [...Array(chars.length).keys()].map(code => encoder(code))
  const encoded = String.fromCharCode(...codes)
  t.is(encoded, chars)
}

test('alpha() encoder chars', (t) => encoder(t, alphaEncoder(), Chars.Alpha))  
test('alphaCase() encoder chars', (t) => encoder(t, alphaCaseEncoder(), Chars.AlphaLower))
test('alphaCase(true) encoder chars', (t) => encoder(t, alphaCaseEncoder(true), Chars.AlphaUpper))
test('alphaNumEncoder() encoder chars', (t) => encoder(t, alphaNumEncoder(), Chars.AlphaNum))
test('alphaNumCaseEncoder() encoder chars', (t) => encoder(t, alphaNumCaseEncoder(), Chars.AlphaNumLower))
test('alphaNumCaseEncoder(true) encoder chars', (t) => encoder(t, alphaNumCaseEncoder(true), Chars.AlphaNumUpper))
test('base32Encoder() encoder chars', (t) => encoder(t, base32Encoder(), Chars.Base32))
test('base32HexCaseEncoder() encoder chars', (t) => encoder(t, base32HexCaseEncoder(), Chars.Base32Hex))
test('base32HexCaseEncoder(true) encoder chars', (t) => encoder(t, base32HexCaseEncoder(true), Chars.Base32HexUpper))
test('decimalEncoder() encoder chars', (t) => encoder(t, decimalEncoder(), Chars.Decimal))
test('hexCaseEncoder() encoder chars', (t) => encoder(t, hexCaseEncoder(), Chars.Hex))
test('hexCaseEncoder(true) encoder chars', (t) => encoder(t, hexCaseEncoder(true), Chars.HexUpper))
test('safeAsciiEncoder() encoder chars', (t) => encoder(t, safeAsciiEncoder(), Chars.SafeAscii))
test('safe32Encoder() encoder chars', (t) => encoder(t, safe32Encoder(), Chars.Safe32))
test('safe64Encoder encoder chars', (t) => encoder(t, safe64Encoder(), Chars.Safe64))
test('symbolEncoder() encoder chars', (t) => encoder(t, symbolEncoder(), Chars.Symbol))
