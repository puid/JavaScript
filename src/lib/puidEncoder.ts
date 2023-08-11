import { PuidEncoder } from '../types/puid'

import { Chars } from './chars'
import alphaEncoder from './encoder/alpha'
import alphaCaseEncoder from './encoder/alphaCase'
import alphaNumEncoder from './encoder/alphaNum'
import base16Encoder from './encoder/base16'
import base32Encoder from './encoder/base32'
import base32HexCaseEncoder from './encoder/base32HexCase'
import crockford32Encoder from './encoder/crockford32'
import customEncoder from './encoder/custom'
import decimalEncoder from './encoder/decimal'
import hexCaseEncoder from './encoder/hexCase'
import safe32Encoder from './encoder/safe32'
import safe64Encoder from './encoder/safe64'
import safeAsciiEncoder from './encoder/safeAscii'
import symbolEncoder from './encoder/symbol'
import wordSafe32Encoder from './encoder/wordSafe32'

export default (chars: string): PuidEncoder => {
  if (chars === Chars.Alpha) return alphaEncoder()
  if (chars === Chars.AlphaLower) return alphaCaseEncoder()
  if (chars === Chars.AlphaUpper) return alphaCaseEncoder(true)
  if (chars === Chars.AlphaNum) return alphaNumEncoder()
  if (chars === Chars.Base16) return base16Encoder()
  if (chars === Chars.Base32) return base32Encoder()
  if (chars === Chars.Base32Hex) return base32HexCaseEncoder()
  if (chars === Chars.Base32HexUpper) return base32HexCaseEncoder(true)
  if (chars === Chars.Crockford32) return crockford32Encoder()
  if (chars === Chars.Decimal) return decimalEncoder()
  if (chars === Chars.Hex) return hexCaseEncoder()
  if (chars === Chars.HexUpper) return hexCaseEncoder(true)
  if (chars === Chars.Safe32) return safe32Encoder()
  if (chars === Chars.Safe64) return safe64Encoder()
  if (chars === Chars.SafeAscii) return safeAsciiEncoder()
  if (chars === Chars.Symbol) return symbolEncoder()
  if (chars === Chars.WordSafe32) return wordSafe32Encoder()
  return customEncoder(chars)
}
