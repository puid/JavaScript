import test, { ExecutionContext } from 'ava'

import { Chars } from './chars'
import alphaEncoder from './encoder/alpha'
import alphaCaseEncoder from './encoder/alphaCase'
import alphaNumEncoder from './encoder/alphaNum'
import base32Encoder from './encoder/base32'
import base32HexCaseEncoder from './encoder/base32HexCase'
import decimalEncoder from './encoder/decimal'
import hexCaseEncoder from './encoder/hexCase'
import safe32Encoder from './encoder/safe32'
import safe64Encoder from './encoder/safe64'
import safeAsciiEncoder from './encoder/safeAscii'

type PuidEncoder = (n: number) => number
const encoderString = (n: number, encoder: PuidEncoder) =>
  String.fromCodePoint(
    ...new Array(n)
      .fill(0)
      .map((zero, ndx) => zero + ndx)
      .map((v) => encoder(v))
  )

const testEncoder = (t: ExecutionContext, encoder: PuidEncoder, chars: string) =>
  t.is(encoderString(chars.length, encoder), chars)

test('alpha() encoder', (t) => testEncoder(t, alphaEncoder(), Chars.Alpha))
test('alphaCase() encoder', (t) => testEncoder(t, alphaCaseEncoder(), Chars.AlphaLower))
test('alphaCase(true) encoder', (t) => testEncoder(t, alphaCaseEncoder(true), Chars.AlphaUpper))
test('alphaNumEncoder() encoder', (t) => testEncoder(t, alphaNumEncoder(), Chars.AlphaNum))
test('base32Encoder() encoder', (t) => testEncoder(t, base32Encoder(), Chars.Base32))
test('base32HexCaseEncoder() encoder', (t) => testEncoder(t, base32HexCaseEncoder(), Chars.Base32Hex))
test('base32HexCaseEncoder(true) encoder', (t) => testEncoder(t, base32HexCaseEncoder(true), Chars.Base32HexUpper))
test('decimalEncoder() encoder', (t) => testEncoder(t, decimalEncoder(), Chars.Decimal))
test('hexCaseEncoder() encoder', (t) => testEncoder(t, hexCaseEncoder(), Chars.Hex))
test('hexCaseEncoder(true) encoder', (t) => testEncoder(t, hexCaseEncoder(true), Chars.HexUpper))
test('safe32Encoder() encoder', (t) => testEncoder(t, safe32Encoder(), Chars.Safe32))
test('safe64Encoder encoder', (t) => testEncoder(t, safe64Encoder(), Chars.Safe64))
test('safeAsciiEncoder() encoder', (t) => testEncoder(t, safeAsciiEncoder(), Chars.SafeAscii))
