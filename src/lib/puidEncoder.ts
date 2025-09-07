import { PuidEncoder } from '../types/puid'

import { Chars } from './chars'
import alphaEncoder from './encoder/alpha'
import alphaCaseEncoder from './encoder/alphaCase'
import alphaNumEncoder from './encoder/alphaNum'
import alphaNumCaseEncoder from './encoder/alphaNumCase'
import base16Encoder from './encoder/base16'
import base32Encoder from './encoder/base32'
import base32HexCaseEncoder from './encoder/base32HexCase'
import base45Encoder from './encoder/base45'
import base58Encoder from './encoder/base58'
import base85Encoder from './encoder/base85'
import bech32Encoder from './encoder/bech32'
import booleanEncoder from './encoder/boolean'
import crockford32Encoder from './encoder/crockford32'
import customEncoder from './encoder/custom'
import decimalEncoder from './encoder/decimal'
import dnaEncoder from './encoder/dna'
import geohashEncoder from './encoder/geohash'
import hexCaseEncoder from './encoder/hexCase'
import safe32Encoder from './encoder/safe32'
import safe64Encoder from './encoder/safe64'
import safeAsciiEncoder from './encoder/safeAscii'
import symbolEncoder from './encoder/symbol'
import urlSafeEncoder from './encoder/urlSafe'
import wordSafe32Encoder from './encoder/wordSafe32'
import zBase32Encoder from './encoder/zBase32'

export default (chars: string): PuidEncoder => {
  if (chars === Chars.Alpha) return alphaEncoder()
  if (chars === Chars.AlphaLower) return alphaCaseEncoder()
  if (chars === Chars.AlphaUpper) return alphaCaseEncoder(true)
  if (chars === Chars.AlphaNum) return alphaNumEncoder()
  if (chars === Chars.AlphaNumLower) return alphaNumCaseEncoder()
  if (chars === Chars.AlphaNumUpper) return alphaNumCaseEncoder(true)
  if (chars === Chars.Base16) return base16Encoder()
  if (chars === Chars.Base32) return base32Encoder()
  if (chars === Chars.Base32Hex) return base32HexCaseEncoder()
  if (chars === Chars.Base32HexUpper) return base32HexCaseEncoder(true)
  if (chars === Chars.Base36) return alphaNumCaseEncoder(false, true)
  if (chars === Chars.Base36Upper) return alphaNumCaseEncoder(true, true)
  if (chars === Chars.Base45) return base45Encoder()
  if (chars === Chars.Base58) return base58Encoder()
  if (chars === Chars.Base85) return base85Encoder()
  if (chars === Chars.Bech32) return bech32Encoder()
  if (chars === Chars.Boolean) return booleanEncoder()
  if (chars === Chars.Crockford32) return crockford32Encoder()
  if (chars === Chars.Decimal) return decimalEncoder()
  if (chars === Chars.Dna) return dnaEncoder()
  if (chars === Chars.Geohash) return geohashEncoder()
  if (chars === Chars.Hex) return hexCaseEncoder()
  if (chars === Chars.Safe32) return safe32Encoder()
  if (chars === Chars.Safe64) return safe64Encoder()
  if (chars === Chars.SafeAscii) return safeAsciiEncoder()
  if (chars === Chars.Symbol) return symbolEncoder()
  if (chars === Chars.UrlSafe) return urlSafeEncoder()
  if (chars === Chars.WordSafe32) return wordSafe32Encoder()
  if (chars === Chars.ZBase32) return zBase32Encoder()
  return customEncoder(chars)
}
